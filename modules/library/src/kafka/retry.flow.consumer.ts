import { EachMessagePayload, KafkaMessage } from 'kafkajs'
import _ from 'lodash'
import Consumer, { TopicArray, TopicPartition } from './consumer'
import Producer from './producer'

interface SubscribeParams {
    topic: string
    handler: MessageHandler
}

type MessageHandler = (args: EachMessagePayload) => Promise<void>

export default class RetryFlow extends Consumer {
    protected topicHandlers: {
        [topic: string]: MessageHandler
    } = {}

    async subscribe ({ topic, handler }: SubscribeParams): Promise<any> {
        await this.consumer.subscribe({topic})
        this.topics.push(topic)
        this.topicHandlers[topic] = handler
    }

    // Master handler / factory to call appropriate handler per topic
    async run (runPaused = this.env.vars.NODE_ENV === 'test'): Promise<void> {
        await this.subscribe({
            topic: this.env.vars.KAFKA_TOPICS_RETRY,
            handler: this.handleRetry.bind(this)
        })

        await this.consumer.run({
            eachMessage: this.handler.bind(this)
        })

        if (runPaused) {
            const topicPartitions: TopicArray = Object.keys(this.topicHandlers).map((topic): TopicPartition => {
                return { topic }
            })
            await this.consumer.pause(topicPartitions)
        }
    }

    private async handler (args: EachMessagePayload): Promise<void> {
        const { topic, message } = args
        if (message.value === null) return

        try {
            const topicHandler = _.get(this.topicHandlers, topic, () => { return (null) })
            await topicHandler(args)
        } catch (e) {
            const producer = new Producer({ logger: this.logger, env: this.env })
            await producer.initialize()

            const retryCounter = parseInt(_.get(message, 'headers.retryCounter', Buffer.from('0')))

            if (retryCounter < this.MAX_RETRIES) {
                await this.sendToRetryTopic(producer, topic, message, retryCounter)
            } else {
                await this.sendToDlq(producer, topic, message, e)
            }

            await producer.disconnect()
        }
    }

    private async handleRetry ({ topic, partition, message }: EachMessagePayload) {
        this.logger.warn(`Retrying message: \n  Headers: ${JSON.stringify(message.headers, replacer)} \n  Key: ${message.key}\n  Value: ${message.value}`)

        const _originalTopic = _.get(message, 'headers._originalTopic')
        const topicHandler = _.get(this.topicHandlers, _originalTopic, () => { return (null) })
        await topicHandler({ topic: _originalTopic, partition, message, heartbeat: () => Promise.resolve() })
    }

    private async sendToRetryTopic (producer: Producer, topic: string, message: any, retryCounter: number) {
        const retryMessage = { ...message }
        _.set(retryMessage, 'headers.retryCounter', (retryCounter + 1).toString())

        if (retryCounter === 0) _.set(retryMessage, 'headers._originalTopic', topic)

        this.logger.debug(`Sending to retry topic... \n Message: \n  Headers: ${JSON.stringify(retryMessage.headers, replacer)} \n  Key: ${retryMessage.key}\n  Value: ${retryMessage.value}`)
        await producer.add({
            topic: this.env.vars.KAFKA_TOPICS_RETRY,
            messages: [retryMessage]
        })
    }

    private async sendToDlq (producer: Producer, topic: string, message: KafkaMessage, error: any) {
        this.logger.error({
            error,
            originalTopic: JSON.parse(JSON.stringify(message.headers, replacer))._originalTopic
        }, `Retry limit reached. Sending to DLQ... \n Message: \n Key: ${message.key}\n  Value: ${message.value}`)

        await producer.add({
            topic: this.env.vars.KAFKA_TOPICS_DLQ,
            messages: [{
                value: JSON.stringify({
                    error: error.message,
                    originalMessage: message
                })
            }]
        })
    }
}

function replacer (this:any, key: string, value:any) {
    if (key !== '') {
        return Buffer.isBuffer(this[key]) ? this[key].toString() : this[key]
    }
    return value
}

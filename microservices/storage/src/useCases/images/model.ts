// ImageJsonSchema.ts
const ImageJsonSchema = {
    type: 'object',
    properties: {
        fileName: {
            type: 'string',
            minLength: 1
        },
        contentType: {
            type: 'string',
            enum: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            description: 'The MIME type of the image'
        }
    },
    required: ['fileName', 'contentType'],
    additionalProperties: false
}

export default ImageJsonSchema

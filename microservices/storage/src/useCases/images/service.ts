import { ImagesRepository } from './repository'
import { BunyanLogger } from 'logger'
import { IImage } from 'project-types'
import {InsertImageDTO, DeleteImageDTO, RetrieveByIdDTO} from './types'

export class ImagesService {
    private repository: ImagesRepository;
    private logger: BunyanLogger;

    constructor ({ repository, logger }: { repository: ImagesRepository, logger: BunyanLogger }) {
        this.repository = repository
        this.logger = logger
    }

    // Retrieve image by ID or with filters (if filters were implemented in the repository)
    async retrieveById (id: string, workspaceId: string): Promise<RetrieveByIdDTO> {
        try {
            return await this.repository.retrieveById({ id, workspaceId })
        } catch (error) {
            this.logger.error(`Error retrieving image with ID ${id}`, error)
            throw error
        }
    }

    // Insert (upload) a new image
    async insert (payload: InsertImageDTO): Promise<IImage> {
        try {
            // Here you might add additional validation logic for the payload if needed
            return await this.repository.insert(payload)
        } catch (error) {
            this.logger.error('Error inserting new image', error)
            throw error
        }
    }

    // Delete image by ID
    async delete (id: string, workspaceId: string): Promise<IImage[]> {
        try {
            const deletePayload: DeleteImageDTO = { id, workspaceId }
            return await this.repository.delete(deletePayload)
        } catch (error) {
            this.logger.error(`Error deleting image with ID ${id}`, error)
            throw error
        }
    }
}

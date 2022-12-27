import {
    Controller,
    Get,
    InternalServerErrorException,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { SuccessResponse } from 'src/common/helpers/response';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { RemoveEmptyQueryPipe } from 'src/common/pipes/removeEmptyQuery.pipe';
import { StorageService } from './services/storage.service';
import { IGetStorageList } from './storage.interfaces';
import { getStorageListSchema } from './storage.validators';

@Controller('/storage')
@UseGuards(AuthenticationGuard)
export class StorageController {
    constructor(private readonly storageService: StorageService) {}

    @Get('/')
    async getStorageList(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(getStorageListSchema),
        )
        query: IGetStorageList,
    ) {
        try {
            query.userId = query.userId ? new ObjectId(query.userId) : null;

            return new SuccessResponse(
                await this.storageService.getStorageList(query),
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}

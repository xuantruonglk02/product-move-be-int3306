import {
    Controller,
    Get,
    HttpStatus,
    InternalServerErrorException,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { ParseObjectIdPipe } from 'src/common/pipes/objectId.validation.pipe';
import { RemoveEmptyQueryPipe } from 'src/common/pipes/removeEmptyQuery.pipe';
import { StorageService } from './services/storage.service';
import { IGetStorageList } from './storage.interfaces';
import { storageMessage } from './storage.messages';
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

    @Get('/:id')
    async getStorageDetail(@Param('id', new ParseObjectIdPipe()) id: ObjectId) {
        try {
            const storage = await this.storageService.getStorageDetail(id);
            if (!storage) {
                return new ErrorResponse(HttpStatus.NOT_FOUND, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: storageMessage.errors.notFound,
                        key: 'id',
                    },
                ]);
            }

            return new SuccessResponse(storage);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}

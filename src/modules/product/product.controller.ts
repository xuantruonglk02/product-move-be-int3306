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
import { commonListQuerySchema } from 'src/common/constants';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { ICommonListQuery } from 'src/common/interfaces';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { ParseObjectIdPipe } from 'src/common/pipes/objectId.validation.pipe';
import { RemoveEmptyQueryPipe } from 'src/common/pipes/removeEmptyQuery.pipe';
import { IGetProductList } from './product.interfaces';
import { productMessages } from './product.messages';
import { getProductListSchema } from './product.validators';
import { ProductService } from './services/product.service';

@Controller('/product')
@UseGuards(AuthenticationGuard)
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Get('product-line')
    async getProductLineList(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(commonListQuerySchema),
        )
        query: ICommonListQuery,
    ) {
        try {
            return new SuccessResponse(
                await this.productService.getProductLineList(query),
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/product-line/:id')
    async getProductLineDetail(
        @Param('id', new ParseObjectIdPipe()) id: ObjectId,
    ) {
        try {
            const productLine = await this.productService.getProductLineDetail(
                id,
            );
            if (!productLine) {
                return new ErrorResponse(HttpStatus.NOT_FOUND, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: productMessages.errors.productLineNotFound,
                        key: 'id',
                    },
                ]);
            }

            return new SuccessResponse(productLine);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('')
    async getProductList(
        @Query(
            new RemoveEmptyQueryPipe(),
            new JoiValidationPipe(getProductListSchema),
        )
        query: IGetProductList,
    ) {
        try {
            query.productLineId = query.productLineId
                ? query.productLineId
                : null;

            return new SuccessResponse(
                await this.productService.getProductList(query),
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/:id')
    async getProductDetail(@Param('id', new ParseObjectIdPipe()) id: ObjectId) {
        try {
            const product = await this.productService.getProductDetail(id);
            if (!product) {
                return new ErrorResponse(HttpStatus.NOT_FOUND, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: productMessages.errors.productNotFound,
                        key: 'id',
                    },
                ]);
            }

            return new SuccessResponse(product);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}

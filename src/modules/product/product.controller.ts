import {
    Controller,
    Get,
    HttpStatus,
    InternalServerErrorException,
    Param,
    UseGuards,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { ParseObjectIdPipe } from 'src/common/pipes/objectId.validation.pipe';
import { productMessages } from './product.messages';
import { ProductService } from './services/product.service';

@Controller('/product')
@UseGuards(AuthenticationGuard)
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Get('/product-line/:id')
    async getProductLineDetail(@Param('id') id: ObjectId) {
        try {
            const productLine = await this.productService.getProductLineDetail(
                id,
            );
            if (!productLine) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
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

    @Get('/:id')
    async getProductDetail(@Param('id', new ParseObjectIdPipe()) id: ObjectId) {
        try {
            const product = await this.productService.getProductDetail(id);
            if (!product) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
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

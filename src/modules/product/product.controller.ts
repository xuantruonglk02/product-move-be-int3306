import {
    Body,
    Controller,
    Get,
    HttpStatus,
    InternalServerErrorException,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { UserRole } from 'src/common/constants';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import {
    AuthorizationGuard,
    Roles,
} from 'src/common/guards/authorization.guard';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { ParseIdPipe } from 'src/common/pipes/id.validation.pipe';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { TrimBodyPipe } from 'src/common/pipes/trimBody.pipe';
import { ICreateProduct, ICreateProductLine } from './product.interfaces';
import { ProductMessages } from './product.messages';
import {
    createProductLineSchema,
    createProductSchema,
} from './product.validators';
import { ProductService } from './services/product.service';

@Controller('/product')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Get('/product-line/:id')
    async getProductLineDetail(@Param('id') id: string) {
        try {
            const productLine = await this.productService.getProductLineDetail(
                id,
            );
            if (!productLine) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: ProductMessages.errors.productLineNotFound,
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
    async getProductDetail(@Param('id', new ParseIdPipe()) id: number) {
        try {
            const product = await this.productService.getProductDetail(id);
            if (!product) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: ProductMessages.errors.productNotFound,
                        key: 'id',
                    },
                ]);
            }

            return new SuccessResponse(product);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/product-line')
    @Roles(UserRole.ADMIN)
    async createProductLine(
        @Req() req,
        @Body(
            new TrimBodyPipe(),
            new JoiValidationPipe(createProductLineSchema),
        )
        body: ICreateProductLine,
    ) {
        try {
            const productLine = await this.productService.getProductLineDetail(
                body.id,
            );
            if (productLine) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.CONFLICT,
                        message: ProductMessages.errors.productLineExists,
                        key: 'id',
                    },
                ]);
            }

            body.createdBy = req.loggedUser.id;
            const newProductLine =
                await this.productService.createNewProductLine(body);
            return new SuccessResponse(
                newProductLine,
                ProductMessages.success.createProductLine,
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/')
    @Roles(UserRole.PRODUCER)
    async createProduct(
        @Req() req,
        @Body(new TrimBodyPipe(), new JoiValidationPipe(createProductSchema))
        body: ICreateProduct,
    ) {
        try {
            const productLine = await this.productService.getProductLineDetail(
                body.productLineId,
            );
            if (!productLine) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: ProductMessages.errors.productLineNotFound,
                        key: 'productLineId',
                    },
                ]);
            }

            body.userOfLocationId = req.loggedUser.id;
            body.createdBy = req.loggedUser.id;
            const newProduct = await this.productService.createNewProduct(body);
            return new SuccessResponse(
                newProduct,
                ProductMessages.success.createProduct,
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}

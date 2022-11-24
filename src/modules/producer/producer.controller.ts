import {
    Body,
    Controller,
    HttpStatus,
    InternalServerErrorException,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import {
    AuthorizationGuard,
    Roles,
} from 'src/common/guards/authorization.guard';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { TrimBodyPipe } from 'src/common/pipes/trimBody.pipe';
import { ICreateProduct } from '../product/product.interfaces';
import { productMessages } from '../product/product.messages';
import { createProductSchema } from '../product/product.validators';
import { ProductService } from '../product/services/product.service';
import { UserRole } from '../user/user.constants';

@Controller('/producer')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(UserRole.PRODUCER)
export class ProducerController {
    constructor(private readonly productService: ProductService) {}

    @Post('/')
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
                        message: productMessages.errors.productLineNotFound,
                        key: 'productLineId',
                    },
                ]);
            }

            body.userOfLocationId = req.loggedUser.id;
            body.createdBy = req.loggedUser.id;
            const newProduct = await this.productService.createNewProduct(body);
            return new SuccessResponse(
                newProduct,
                productMessages.success.createProduct,
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}

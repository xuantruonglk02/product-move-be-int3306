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
import { UserService } from '../user/services/user.service';
import { UserRole } from '../user/user.constants';
import { userMessages } from '../user/user.messages';
import { IExportNewProductToAgency } from './producer.interfaces';
import { producerMessages } from './producer.messages';
import { exportNewProductToAgencySchema } from './producer.validators';
import { ProducerService } from './services/producer.service';

@Controller('/producer')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(UserRole.PRODUCER)
export class ProducerController {
    constructor(
        private readonly producerService: ProducerService,
        private readonly productService: ProductService,
        private readonly userService: UserService,
    ) {}

    @Post('/product')
    async createProduct(
        @Req() req,
        @Body(new TrimBodyPipe(), new JoiValidationPipe(createProductSchema))
        body: ICreateProduct,
    ) {
        try {
            const productLine = await this.productService.getProductLineDetail(
                body.productLineId,
                ['_id'],
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

            body.userId = req.loggedUser._id;
            body.createdBy = req.loggedUser._id;
            const newProduct = await this.productService.createNewProduct(body);
            return new SuccessResponse(
                newProduct,
                productMessages.success.createProduct,
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/export-to-agency')
    async exportNewProductToAgency(
        @Req() req,
        @Body(
            new TrimBodyPipe(),
            new JoiValidationPipe(exportNewProductToAgencySchema),
        )
        body: IExportNewProductToAgency,
    ) {
        try {
            const agency = await this.userService.getUserByField(
                {
                    key: '_id',
                    value: body.agencyId,
                },
                ['role'],
            );
            if (!agency) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: userMessages.errors.userNotFound,
                        key: 'agencyId',
                    },
                ]);
            }
            if (agency.role !== UserRole.AGENCY) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.FORBIDDEN,
                        message: producerMessages.errors.notAgency,
                        key: 'agencyId',
                    },
                ]);
            }

            const product = await this.productService.getProductDetail(
                body.productId,
                ['_id'],
            );
            if (!product) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: productMessages.errors.productNotFound,
                        key: 'productId',
                    },
                ]);
            }

            const transition =
                await this.producerService.exportNewProductToAgency(
                    body.productId,
                    req.loggedUser._id,
                    body.agencyId,
                );
            return new SuccessResponse(transition);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}

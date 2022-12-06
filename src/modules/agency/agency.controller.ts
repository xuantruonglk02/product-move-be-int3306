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
import { ICreateOrder } from '../order/order.interfaces';
import { productMessages } from '../product/product.messages';
import { ProductService } from '../product/services/product.service';
import { UserService } from '../user/services/user.service';
import { UserRole } from '../user/user.constants';
import { userMessages } from '../user/user.messages';
import { IImportNewProductFromProducer } from './agency.interfaces';
import { agencyMessages } from './agency.messages';
import {
    checkoutProductSchema,
    importNewProductFromProducerSchema,
} from './agency.validators';
import { AgencyService } from './services/agency.service';

@Controller('/agency')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(UserRole.AGENCY)
export class AgencyController {
    constructor(
        private readonly agencyService: AgencyService,
        private readonly productService: ProductService,
        private readonly userService: UserService,
    ) {}

    @Post('/import-new-product')
    async importNewProductFromProducer(
        @Req() req,
        @Body(
            new TrimBodyPipe(),
            new JoiValidationPipe(importNewProductFromProducerSchema),
        )
        body: IImportNewProductFromProducer,
    ) {
        try {
            const producer = await this.userService.getUserByField(
                {
                    key: '_id',
                    value: body.producerId,
                },
                ['role'],
            );
            if (!producer) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: userMessages.errors.userNotFound,
                        key: 'producerId',
                    },
                ]);
            }
            if (producer.role !== UserRole.PRODUCER) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.FORBIDDEN,
                        message: agencyMessages.errors.notProducer,
                        key: 'producerId',
                    },
                ]);
            }

            const product = await this.productService.getProductById(
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
                await this.agencyService.importNewProductFromProducer(
                    body.transitionId,
                    req.loggedUser._id,
                );
            return new SuccessResponse(transition);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/checkout')
    async checkout(
        @Req() req,
        @Body(new TrimBodyPipe(), new JoiValidationPipe(checkoutProductSchema))
        body: ICreateOrder,
    ) {
        try {
            // TODO: check

            body.createdBy = req.loggedUser._id;
            const order = await this.agencyService.createNewCheckout(body);
            return new SuccessResponse(order);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}

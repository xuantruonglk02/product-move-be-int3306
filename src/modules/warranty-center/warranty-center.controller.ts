import {
    Body,
    Controller,
    HttpStatus,
    InternalServerErrorException,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import {
    AuthorizationGuard,
    Roles,
} from 'src/common/guards/authorization.guard';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { convertObjectId } from 'src/common/helpers/utilityFunctions';
import { JoiValidationPipe } from 'src/common/pipes/joi.validation.pipe';
import { TrimBodyPipe } from 'src/common/pipes/trimBody.pipe';
import { ProductStatus } from '../product/product.constants';
import { productMessages } from '../product/product.messages';
import { ProductService } from '../product/services/product.service';
import { UserService } from '../user/services/user.service';
import { UserRole } from '../user/user.constants';
import { WarrantyService } from './services/warranty.service';
import { IReceiveErrorProductFromAgency } from './warranty-center.interfaces';
import warrantyCenterMessages from './warranty-center.messages';
import { receiveErrorProductFromAgency } from './warranty-center.validators';

@Controller('/warranty-center')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(UserRole.WARRANTY_CENTER)
export class WarrantyCenterController {
    constructor(
        private readonly warrantyService: WarrantyService,
        private readonly userService: UserService,
        private readonly productService: ProductService,
    ) {}

    @Post('/receive-error-product')
    async receiveErrorProduct(
        @Req() req,
        @Body(
            new TrimBodyPipe(),
            new JoiValidationPipe(receiveErrorProductFromAgency),
        )
        body: IReceiveErrorProductFromAgency,
    ) {
        try {
            convertObjectId(body, ['transitionId']);

            const transition =
                await this.productService.getProductStatusTransition(
                    body.transitionId,
                    ['nextUserId', 'previousStatus', 'nextStatus'],
                );
            if (!transition) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.NOT_FOUND,
                        message: productMessages.errors.transitionNotFound,
                        key: 'transitionId',
                    },
                ]);
            }
            if (
                transition.previousStatus !== ProductStatus.NEED_WARRANTY &&
                transition.nextStatus !== ProductStatus.IN_WARRANTY
            ) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message: productMessages.errors.transitionWrong,
                        key: 'transitionId',
                    },
                ]);
            }
            if (
                transition.nextUserId.toString() !==
                req.loggedUser._id.toString()
            ) {
                return new ErrorResponse(HttpStatus.BAD_REQUEST, [
                    {
                        code: HttpStatus.UNPROCESSABLE_ENTITY,
                        message:
                            warrantyCenterMessages.errors.transitionNotToThis,
                        key: 'transitionId',
                    },
                ]);
            }

            return new SuccessResponse(
                await this.warrantyService.handleWarranty(
                    new ObjectId(req.loggedUser._id),
                    body,
                ),
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}

import { ProductLocation, ProductStatus } from './product.constants';

export interface IProductLine {
    id: string;
    name: string;
    price: number;
    quantityOfProduct: number;
}

export interface IProduct {
    id: number;
    productLineId: string;
    userOfLocationId: number | null;
    status: ProductStatus;
    location: ProductLocation;
}

export interface ICreateProductLine extends IProductLine {
    createdBy: number;
}

export interface ICreateProduct
    extends Omit<IProduct, 'id' | 'status' | 'location'> {
    createdBy: number;
}

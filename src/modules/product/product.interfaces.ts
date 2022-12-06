import { ObjectId } from 'mongodb';
import {
    ProductColor,
    ProductLocation,
    ProductStatus,
} from './product.constants';

export interface IProductLine {
    name: string;
    price: number;
    quantityOfProduct: number;
}

export interface IProduct {
    productLineId: ObjectId;
    userId: ObjectId | null;
    storageId: ObjectId | null;
    name: string;
    description: string;
    weight: number;
    displaySize: number;
    bodySize: string;
    color: ProductColor;
    bodyBuild: string;
    batteryVolume: number;
    status: ProductStatus;
    location: ProductLocation;
    sold: boolean;
    soldDate: Date | null;
}

export interface ICreateProductLine extends IProductLine {
    createdBy: ObjectId;
}

export interface ICreateProduct
    extends Omit<IProduct, 'status' | 'location' | 'sold' | 'soldDate'> {
    createdBy: ObjectId;
}

export interface IImportNewProductFromProducer {
    producerId: number;
    productId: number;
}

export interface ICheckout {
    agencyId: number;
    productIds: number[];
    customerName: string;
    customerEmail: string;
    customerPhone: string;
}

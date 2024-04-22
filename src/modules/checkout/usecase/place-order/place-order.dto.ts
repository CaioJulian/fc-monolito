export interface PlaceOrderInputDto {
  clientId: string;
  products: {
    productId: string;
    salesPrice: number;
  }[];
}

export interface PlaceOrderOutputDto {
  id: string;
  invoiceId: string;
  status: string;
  total: number;
  products: {
    productId: string;
    salesPrice: number;
  }[];
}

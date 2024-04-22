export interface PlaceOrderFacadeInputDto {
  clientId: string;
  products: {
    productId: string;
    salesPrice: number;
  }[];
}

export interface PlaceOrderFacadeOutputDto {
  id: string;
  invoiceId: string;
  status: string;
  total: number;
  products: {
    productId: string;
  }[];
}

export default interface CheckoutFacadeInterface {
  placeOrder(
    input: PlaceOrderFacadeInputDto
  ): Promise<PlaceOrderFacadeOutputDto>;
}

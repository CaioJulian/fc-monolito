import PlaceOrderUseCase from "../usecase/place-order/place-order.usecase";
import CheckoutFacadeInterface, {
  PlaceOrderFacadeInputDto,
  PlaceOrderFacadeOutputDto,
} from "./checkout.facade.interface";

export default class CheckoutFacade implements CheckoutFacadeInterface {
  constructor(private readonly placeOrderUseCase: PlaceOrderUseCase) {}

  async placeOrder(
    input: PlaceOrderFacadeInputDto
  ): Promise<PlaceOrderFacadeOutputDto> {
    const order = await this.placeOrderUseCase.execute(input);
    return {
      id: order.id,
      invoiceId: order.invoiceId,
      status: order.status,
      total: order.total,
      products: order.products,
    };
  }
}

import PlaceOrderUseCase from "../usecase/place-order/place-order.usecase";
import CheckoutFacade from "./checkout.facade";

describe("Checkout Facade test", () => {
  it("should create a order", async () => {
    const mock = {
      id: "456",
      invoiceId: "123456",
      total: 100,
    };

    const mockPlaceOrderCase = (): PlaceOrderUseCase => {
      // @ts-ignore
      return {
        execute: jest.fn().mockReturnValue(mock),
      };
    };

    const facade = new CheckoutFacade(mockPlaceOrderCase());

    const output = await facade.placeOrder({
      clientId: "123",
      products: [
        {
          productId: "6789",
          salesPrice: 10,
        },
      ],
    });

    expect(output.id).toBe(mock.id);
    expect(output.invoiceId).toBe(mock.invoiceId);
    expect(output.total).toBe(mock.total);
  });
});

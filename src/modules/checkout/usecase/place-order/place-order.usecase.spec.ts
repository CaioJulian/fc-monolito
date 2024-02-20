import { PlaceOrderInputDto } from "./place-order.dto";
import PlaceOrderUseCase from "./place-order.usecase";
import Product from "../../domain/product.entity";
import Id from "../../../@shared/domain/value-object/id.value-object";

const mockDate = new Date(2000, 1, 1);

describe("PlaceOrderUseCase unit test", () => {
  describe("validateProducts method", () => {
    //@ts-expect-error - no params in constructor
    const placeOrderUseCase = new PlaceOrderUseCase();

    it("should throw an error if no products are selected", async () => {
      const input: PlaceOrderInputDto = { clientId: "1", products: [] };
      await expect(
        placeOrderUseCase["validateProducts"](input)
      ).rejects.toThrow(new Error("No products selected"));
    });

    it("should throw an error when products is out stock", async () => {
      const mockProductFacade = {
        checkStock: jest.fn(({ productId }: { productId: string }) =>
          Promise.resolve({ productId, stock: productId === "1" ? 0 : 1 })
        ),
      };

      //@ts-expect-error - force set productFacade
      placeOrderUseCase["_productFacade"] = mockProductFacade;

      let input: PlaceOrderInputDto = {
        clientId: "0",
        products: [{ productId: "1" }],
      };

      await expect(
        placeOrderUseCase["validateProducts"](input)
      ).rejects.toThrow(new Error("Product 1 is not available in stock"));

      input = {
        clientId: "0",
        products: [{ productId: "0" }, { productId: "1" }],
      };
      await expect(
        placeOrderUseCase["validateProducts"](input)
      ).rejects.toThrow(new Error("Product 1 is not available in stock"));
      expect(mockProductFacade.checkStock).toBeCalledTimes(3);

      input = {
        clientId: "0",
        products: [{ productId: "0" }, { productId: "1" }, { productId: "2" }],
      };
      await expect(
        placeOrderUseCase["validateProducts"](input)
      ).rejects.toThrow(new Error("Product 1 is not available in stock"));
      expect(mockProductFacade.checkStock).toBeCalledTimes(5);
    });
  });

  describe("getProduct method", () => {
    beforeAll(() => {
      jest.useFakeTimers("modern");
      jest.setSystemTime(mockDate);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    //@ts-expect-error - no params in constructor
    const placeOrderUseCase = new PlaceOrderUseCase();

    it("should throw an error when product not found", async () => {
      const mockCatalogFacade = {
        find: jest.fn().mockResolvedValue(null),
      };

      //@ts-expect-error - force set catalogFacade
      placeOrderUseCase["_catalogFacade"] = mockCatalogFacade;

      await expect(placeOrderUseCase["getProduct"]("0")).rejects.toThrow(
        new Error("Product not found")
      );
    });

    it("should return a product", async () => {
      const mockCatalogFacade = {
        find: jest.fn().mockResolvedValue({
          id: "0",
          name: "Product 0",
          description: "Product 0 description",
          salesPrice: 0,
        }),
      };

      //@ts-expect-error - force set catalogFacade
      placeOrderUseCase["_catalogFacade"] = mockCatalogFacade;

      const product = await placeOrderUseCase["getProduct"]("0");
      expect(product).toEqual(
        new Product({
          id: new Id("0"),
          name: "Product 0",
          description: "Product 0 description",
          salesPrice: 0,
        })
      );
      expect(mockCatalogFacade.find).toBeCalledTimes(1);
    });
  });

  describe("execute method", () => {
    beforeAll(() => {
      jest.useFakeTimers("modern");
      jest.setSystemTime(mockDate);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it("should throw an error if client is not found", async () => {
      const mockClientFacade = {
        find: jest.fn().mockResolvedValue(null),
      };
      //@ts-expect-error - no params in constructor
      const placeOrderUseCase = new PlaceOrderUseCase();
      //@ts-expect-error - force set clientFacade
      placeOrderUseCase["_clientFacade"] = mockClientFacade;

      const input: PlaceOrderInputDto = {
        clientId: "1",
        products: [],
      };

      await expect(placeOrderUseCase.execute(input)).rejects.toThrow(
        new Error("Client not found")
      );
    });

    it("should throw an error when products are not valid", async () => {
      const mockClientFacade = {
        find: jest.fn().mockResolvedValue(true),
      };
      //@ts-expect-error - no params in constructor
      const placeOrderUseCase = new PlaceOrderUseCase();

      const mockValidateProducts = jest
        .spyOn(placeOrderUseCase as any, "validateProducts")
        .mockRejectedValue(new Error("No products selected"));

      //@ts-expect-error - force set clientFacade
      placeOrderUseCase["_clientFacade"] = mockClientFacade;

      const input: PlaceOrderInputDto = { clientId: "1", products: [] };
      await expect(placeOrderUseCase.execute(input)).rejects.toThrow(
        new Error("No products selected")
      );
      expect(mockValidateProducts).toBeCalledTimes(1);
    });

    describe("place an order", () => {
      const addressProps = {
        street: "some address",
        number: "123",
        complement: "apt 123",
        city: "Some City",
        state: "SS",
        zipCode: "12345678",
      };

      const clientProps = {
        id: "1c",
        name: "Client 1",
        document: "123456789",
        email: "client@user.com",
        address: addressProps,
      };

      const mockClientFacade = {
        find: jest.fn().mockResolvedValue(clientProps),
      };

      const mockPaymentFacade = {
        process: jest.fn(),
      };

      const mockCheckoutRepo = {
        addOrder: jest.fn(),
      };

      const mockInvoiceFacade = {
        generate: jest.fn().mockResolvedValue({ id: "1i" }),
      };

      const placeOrderUseCase = new PlaceOrderUseCase(
        mockClientFacade as any,
        null,
        null,
        mockCheckoutRepo as any,
        mockInvoiceFacade as any,
        mockPaymentFacade as any
      );

      const products = {
        "1": new Product({
          id: new Id("1"),
          name: "Product 1",
          description: "Product 1 description",
          salesPrice: 100,
        }),
        "2": new Product({
          id: new Id("2"),
          name: "Product 2",
          description: "Product 2 description",
          salesPrice: 200,
        }),
      };

      const mockValidateProducts = jest
        .spyOn(placeOrderUseCase as any, "validateProducts")
        .mockResolvedValue(null);

      const mockGetProduct = jest
        .spyOn(placeOrderUseCase as any, "getProduct")
        //@ts-expect-error - spy on private method
        .mockImplementation((productId: keyof typeof products) => {
          return products[productId];
        });

      it("should not be approved", async () => {
        mockPaymentFacade.process = mockPaymentFacade.process.mockResolvedValue(
          {
            transaction: "1t",
            orderId: "1o",
            amount: 300,
            status: "error",
            createdAt: new Date(),
            update: new Date(),
          }
        );

        const input: PlaceOrderInputDto = {
          clientId: "1c",
          products: [{ productId: "1" }, { productId: "2" }],
        };

        let output = await placeOrderUseCase.execute(input);

        expect(output.id).toBeTruthy();
        expect(output.total).toBe(300);
        expect(output.products).toEqual([
          { productId: "1" },
          { productId: "2" },
        ]);
        expect(mockClientFacade.find).toHaveBeenCalledTimes(1);
        expect(mockClientFacade.find).toHaveBeenCalledWith({ id: "1c" });
        expect(mockValidateProducts).toHaveBeenCalledTimes(1);
        expect(mockValidateProducts).toHaveBeenCalledWith(input);
        expect(mockGetProduct).toHaveBeenCalledTimes(2);
        expect(mockCheckoutRepo.addOrder).toHaveBeenCalledTimes(1);
        expect(mockPaymentFacade.process).toHaveBeenCalledTimes(1);
        expect(mockPaymentFacade.process).toHaveBeenCalledWith({
          orderId: output.id,
          amount: output.total,
        });
        expect(mockInvoiceFacade.generate).toHaveBeenCalledTimes(0);
      });

      it("should be approved", async () => {
        mockPaymentFacade.process = mockPaymentFacade.process.mockResolvedValue(
          {
            transaction: "1t",
            orderId: "1o",
            amount: 300,
            status: "approved",
            createdAt: new Date(),
            update: new Date(),
          }
        );

        const input: PlaceOrderInputDto = {
          clientId: "1c",
          products: [{ productId: "1" }, { productId: "2" }],
        };

        let output = await placeOrderUseCase.execute(input);

        expect(output.invoiceId).toBe("1i");
        expect(output.total).toBe(300);
        expect(output.products).toStrictEqual([
          { productId: "1" },
          { productId: "2" },
        ]);
        expect(mockClientFacade.find).toHaveBeenCalledTimes(1);
        expect(mockClientFacade.find).toHaveBeenCalledWith({ id: "1c" });
        expect(mockValidateProducts).toHaveBeenCalledTimes(1);
        expect(mockGetProduct).toHaveBeenCalledTimes(2);
        expect(mockCheckoutRepo.addOrder).toHaveBeenCalledTimes(1);
        expect(mockPaymentFacade.process).toHaveBeenCalledTimes(1);
        expect(mockPaymentFacade.process).toHaveBeenCalledWith({
          orderId: output.id,
          amount: output.total,
        });
        expect(mockInvoiceFacade.generate).toHaveBeenCalledTimes(1);
        expect(mockInvoiceFacade.generate).toHaveBeenCalledWith({
          name: clientProps.name,
          document: clientProps.document,
          street: clientProps.address.street,
          number: clientProps.address.number,
          complement: clientProps.address.complement,
          city: clientProps.address.city,
          state: clientProps.address.state,
          zipCode: clientProps.address.zipCode,
          items: [
            { id: "1", name: "Product 1", price: 100 },
            { id: "2", name: "Product 2", price: 200 },
          ],
        });
      });
    });
  });
});

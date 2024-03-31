import { app } from "../express";
import {
  migration,
  sequelize,
  setupDb,
} from "../../../infrastructure/db/setup.database";
import request from "supertest";
import Id from "../../../modules/@shared/domain/value-object/id.value-object";
import * as CheckStockUseCase from "../../../modules/product-adm/usecase/check-stock/check-stock.usecase";
import * as GenerateInvoiceUseCase from "../../../modules/invoice/usecase/generate-invoice/generate-invoice.usecase";
import * as PlaceOrderUseCase from "../../../modules/checkout/usecase/place-order/place-order.usecase";

describe("Checkout API e2e test", () => {
  beforeEach(async () => {
    await setupDb();
  });

  afterEach(async () => {
    await migration.down();
    await sequelize.close();
  });

  it("should create a checkout", async () => {
    const productOne = await request(app).post("/products").send({
      id: "6789",
      name: "Product One",
      description: "Product one description",
      purchasePrice: 50,
      stock: 10,
    });

    await request(app)
      .post("/clients")
      .send({
        id: "123",
        name: "Client Test",
        email: "test@example.com",
        document: "1234567890",
        address: {
          street: "Street example",
          number: "1230",
          complement: "Complement example",
          city: "City Example",
          state: "SE",
          zipCode: "12345678",
        },
      });

    const invoiceId = new Id();
    // @ts-ignore
    jest.spyOn(CheckStockUseCase, "default").mockImplementation(() => ({
      execute: jest.fn(({ productId }: { productId: string }) =>
        Promise.resolve({
          productId,
          stock: 10,
        })
      ),
    }));

    jest.spyOn(GenerateInvoiceUseCase, "default").mockImplementation(() => ({
      // @ts-ignore
      execute: jest.fn((invoice) => Promise.resolve({ id: invoiceId })),
    }));

    jest.spyOn(PlaceOrderUseCase, "default").mockImplementation(() => ({
      // @ts-ignore
      execute: jest.fn((order) =>
        Promise.resolve({
          id: new Id(),
          invoiceId: invoiceId,
          status: "approved",
          total: 100,
          products: [
            {
              productId: productOne.body.id,
            },
          ],
        })
      ),
    }));

    const response = await request(app)
      .post("/checkout")
      .send({
        clientId: "123",
        products: [{ productId: "6789", salesPrice: 100 }],
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.invoiceId).toEqual(invoiceId);
    expect(response.body.status).toBe("approved");
    expect(response.body.total).toBe(100);
    expect(response.body.products.length).toBe(1);
    expect(response.body.products[0].productId).toBe(productOne.body.id);
  });
});

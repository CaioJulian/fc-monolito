import { app } from "../express";
import {
  migration,
  sequelize,
  setupDb,
} from "../../../infrastructure/db/setup.database";
import request from "supertest";

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

    const response = await request(app)
      .post("/checkout")
      .send({
        clientId: "123",
        products: [{ productId: productOne.body.id, salesPrice: 100 }],
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.invoiceId).toBeDefined();
    expect(response.body.status).toBe("approved");
    expect(response.body.total).toBe(100);
    expect(response.body.products.length).toBe(1);
    expect(response.body.products[0].productId).toBe(productOne.body.id);
    expect(response.body.products[0].salesPrice).toBe(100);
  });
});

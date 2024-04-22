import request from "supertest";
import { migration, sequelize, setupDb } from "../../db/setup.database";
import { app } from "../express";

describe("Invoice API e2e test", () => {
  beforeEach(async () => {
    await setupDb();
  });

  afterEach(async () => {
    await migration.down();
    await sequelize.close();
  });

  it("should find an invoice", async () => {
    const productOne = await request(app).post("/products").send({
      name: "Product One",
      description: "Product one description",
      purchasePrice: 50,
      stock: 10,
    });

    const productTwo = await request(app).post("/products").send({
      name: "Product Two",
      description: "Product two description",
      purchasePrice: 70,
      stock: 5,
    });

    const client = {
      id: "789",
      name: "Client test",
      email: "test@example.com",
      document: "1234567890",
      address: {
        street: "Street example",
        number: "1230",
        complement: "Complement example",
        city: "City example",
        state: "SE",
        zipCode: "12345678",
      },
    };

    await request(app).post("/clients").send(client);

    const checkoutResponse = await request(app)
      .post("/checkout")
      .send({
        clientId: "789",
        products: [
          {
            productId: productOne.body.id,
            salesPrice: 100,
          },
          {
            productId: productTwo.body.id,
            salesPrice: 200,
          },
        ],
      });

    const { invoiceId } = checkoutResponse.body;
    const invoiceResponse = await request(app).get(`/invoice/${invoiceId}`);
    const { status, body } = invoiceResponse;

    expect(status).toBe(200);
    expect(body).toBeDefined();
    expect(body.id).toBe(invoiceId);
    expect(body.total).toBe(300);
    expect(body.name).toBe(client.name);
    expect(body.document).toBe(client.document);
    expect(body.street).toBe(client.address.street);
    expect(body.number).toBe(client.address.number);
    expect(body.complement).toBe(client.address.complement);
    expect(body.city).toBe(client.address.city);
    expect(body.state).toBe(client.address.state);
    expect(body.zipCode).toBe(client.address.zipCode);
    expect(body.items).toBeDefined();
    expect(body.items.length).toBe(2);
    expect(body.items[0].id).toBeDefined();
    expect(body.items[0].name).toBe(productOne.body.name);
    expect(body.items[0].price).toBe(100);
    expect(body.items[1].id).toBeDefined();
    expect(body.items[1].name).toBe(productTwo.body.name);
    expect(body.items[1].price).toBe(200);
  });
});

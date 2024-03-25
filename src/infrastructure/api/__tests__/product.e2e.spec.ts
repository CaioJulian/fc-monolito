import request from "supertest";
import { setupDb, sequelize, migration } from "../../db/setup.database";
import { app } from "../express";

describe("Product API e2e test", () => {
  
  beforeEach(async () => {
    await setupDb();
  });
  afterEach(async () => {
    await migration.down();
    await sequelize.close();
  });

  it("should create a product", async () => {
    const product = {
      name: "Product 1",
      description: "Product 1 description",
      purchasePrice: 100,
      stock: 10,
    };

    const response = await request(app).post("/products").send(product);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: product.name,
        description: product.description,
        purchasePrice: product.purchasePrice,
        stock: product.stock,
      })
    );
  });
});

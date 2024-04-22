import request from "supertest";
import { migration, sequelize, setupDb } from "../../db/setup.database";
import { app } from "../express";

describe("Clients API e2e test", () => {
  beforeEach(async () => {
    await setupDb();
  });
  afterEach(async () => {
    await migration.down();
    await sequelize.close();
  });

  it("should create a client", async () => {
    const client = {
      name: "Client 1",
      email: "client@example.com",
      document: "1234567890",
      address: {
        street: "Street One",
        number: "123",
        complement: "Complement house",
        city: "City example",
        state: "State example",
        zipCode: "12345678",
      },
    };

    const response = await request(app).post("/clients").send(client);
    expect(response.status).toBe(201);
  });
});

import { Sequelize } from "sequelize-typescript";
import OrderModel from "./order.model";
import OrderItemModel from "./order-item.model";
import { ClientModel } from "../../client-adm/repository/client.model";
import ProductModel from "../../store-catalog/repository/product.model";
import Address from "../../@shared/domain/value-object/address";
import Client from "../domain/client.entity";
import Id from "../../@shared/domain/value-object/id.value-object";
import OrderItem from "../domain/order-item.entity";
import CheckoutRepository from "./checkout.repository";
import Order from "../domain/order.entity";

describe("Checkout Repository", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([
      OrderModel,
      OrderItemModel,
      ClientModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should place an order", async () => {
    const address = new Address(
      "Street example",
      "123",
      "Complement one",
      "Cit example",
      "SE",
      "12345678"
    );
    const client = new Client({
      name: "Client",
      email: "Email",
      address: address,
    });

    await ClientModel.create({
      id: client.id.id,
      name: client.name,
      email: client.email,
      document: "456789",
      street: client.address.street,
      number: client.address.number,
      complement: client.address.complement,
      city: client.address.city,
      state: client.address.state,
      zipcode: client.address.zipCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const productOne = new OrderItem({
      id: new Id("1234"),
      name: "Product one",
      description: "Description one",
      salesPrice: 100,
    });

    const productTwo = new OrderItem({
      id: new Id("6789"),
      name: "Product two",
      description: "Description two",
      salesPrice: 200,
    });

    await ProductModel.create({
      id: productOne.id.id,
      name: productOne.name,
      description: productOne.description,
      salesPrice: productOne.salesPrice,
    });

    await ProductModel.create({
      id: productTwo.id.id,
      name: productTwo.name,
      description: productTwo.description,
      salesPrice: productTwo.salesPrice,
    });

    const order = new Order({
      id: new Id("1"),
      client: client,
      products: [productOne, productTwo],
    });
    const repository = new CheckoutRepository();
    await repository.addOrder(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id.id },
      include: ["products", "client"],
    });

    expect(orderModel.id).toBe(order.id.id);
    expect(orderModel.client.id).toBe(client.id.id);

    expect(orderModel.products.length).toBe(2);
    expect(orderModel.products[0].id).toBe(productOne.id.id);
    expect(orderModel.products[0].salesPrice).toBe(productOne.salesPrice);
    expect(orderModel.products[1].id).toBe(productTwo.id.id);
    expect(orderModel.products[1].salesPrice).toBe(productTwo.salesPrice);
  });

  it("should find an order", async () => {
    const address = new Address(
      "Street one",
      "3210",
      "Complement example",
      "City Example",
      "SE",
      "12234567"
    );
    const client = new Client({
      name: "Client test",
      email: "test@example.com",
      address: address,
    });

    await ClientModel.create({
      id: client.id.id,
      name: client.name,
      email: client.email,
      document: "456789",
      street: client.address.street,
      number: client.address.number,
      complement: client.address.complement,
      city: client.address.city,
      state: client.address.state,
      zipcode: client.address.zipCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const productOne = new OrderItem({
      id: new Id("456"),
      name: "Product One",
      description: "Description one",
      salesPrice: 100,
    });

    await ProductModel.create({
      id: productOne.id.id,
      name: productOne.name,
      description: productOne.description,
      salesPrice: productOne.salesPrice,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const order = new Order({
      id: new Id("789"),
      client: client,
      products: [productOne],
    });

    const orderCreated = await OrderModel.create(
      {
        id: order.id.id,
        clientId: order.client.id.id,
        status: order.status,
        products: order.products.map((item) => ({
          id: item.id.id,
          name: item.name,
          description: item.description,
          salesPrice: item.salesPrice,
        })),
      },
      { include: [OrderModel.associations.products] }
    );

    const repository = new CheckoutRepository();
    const result = await repository.findOrder(orderCreated.id);

    expect(result.id.id).toBe(orderCreated.id);
    expect(result.client.id.id).toBe(orderCreated.clientId);
    expect(result.products.length).toBe(1);
    expect(result.products[0].id.id).toBe(orderCreated.products[0].id);
    expect(result.products[0].name).toBe("Product One");
    expect(result.products[0].name).toBe(orderCreated.products[0].name);
    expect(result.products[0].description).toBe(
      orderCreated.products[0].description
    );
    expect(result.products[0].salesPrice).toBe(
      orderCreated.products[0].salesPrice
    );
  });
});

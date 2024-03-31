import Address from "../../@shared/domain/value-object/address";
import Id from "../../@shared/domain/value-object/id.value-object";
import Client from "../domain/client.entity";
import Order from "../domain/order.entity";
import Product from "../domain/product.entity";
import CheckoutGateway from "../gateway/checkout.gateway";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class CheckoutRepository implements CheckoutGateway {
  async addOrder(order: Order): Promise<void> {
    const createdOrder = await OrderModel.create({
      id: order.id.id,
      clientId: order.client.id.id,
    });

    for (const item of order.products) {
      await OrderItemModel.create({
        orderId: createdOrder.id,
        productId: item.id.id,
        price: item.salesPrice,
      });
    }
  }
  async findOrder(id: string): Promise<Order> {
    const order = await OrderModel.findByPk(id, {
      include: [{ all: true, nested: true }],
    });

    const address = new Address(
      order.client.street,
      order.client.number,
      order.client.complement,
      order.client.city,
      order.client.state,
      order.client.zipcode
    );
    return new Order({
      id: new Id(order.id),
      client: new Client({
        id: new Id(order.clientId),
        name: order.client.name,
        email: order.client.email,
        address: address,
      }),
      products: order.items.map((item) => {
        return new Product({
          id: new Id(item.productId),
          name: item.product.name,
          description: item.product.description,
          salesPrice: item.price,
        });
      }),
    });
  }
}

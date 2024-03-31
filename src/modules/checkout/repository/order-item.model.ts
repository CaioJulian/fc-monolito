import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import OrderModel from "./order.model";
import ProductModel from "../../store-catalog/repository/product.model";

@Table({
  tableName: "order_items",
  timestamps: false,
})
export default class OrderItemModel extends Model {
  @ForeignKey(() => OrderModel)
  @Column({ allowNull: false })
  orderId: string;

  @ForeignKey(() => ProductModel)
  @Column({ allowNull: false })
  productId: string;

  @BelongsTo(() => ProductModel)
  product: ProductModel;

  @Column({ allowNull: false })
  price: number;
}

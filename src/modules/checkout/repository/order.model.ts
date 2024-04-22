import {
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { ClientModel } from "../../client-adm/repository/client.model";
import OrderItemModel from "./order-item.model";

@Table({
  tableName: "orders",
  timestamps: false,
})
export default class OrderModel extends Model {
  @PrimaryKey
  @Column({ allowNull: false })
  id: string;

  @ForeignKey(() => ClientModel)
  @Column({ allowNull: false })
  clientId: string;

  @BelongsTo(() => ClientModel)
  client: ClientModel;

  @HasMany(() => OrderItemModel)
  products: OrderItemModel[];

  @Column({ allowNull: true })
  status: string;
}

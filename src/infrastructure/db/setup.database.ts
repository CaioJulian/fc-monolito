import { Sequelize } from "sequelize-typescript";
import { Umzug } from "umzug";
import { migrator } from "./migrator";
import ProductModel from "../../modules/store-catalog/repository/product.model";
import { ProductModel as AdmProductModel } from "../../modules/product-adm/repository/product.model";
import { ClientModel } from "../../modules/client-adm/repository/client.model";
import TransactionModel from "../../modules/payment/repository/transaction.model";
import { InvoiceModel } from "../../modules/invoice/repository/invoice.model";
import { InvoiceItemModel } from "../../modules/invoice/repository/invoice-item.model";
import OrderModel from "../../modules/checkout/repository/order.model";
import OrderItemModel from "../../modules/checkout/repository/order-item.model";

let sequelize: Sequelize;
let migration: Umzug<any>;

async function setupDb() {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  });
  migration = migrator(sequelize);
  await migration.up();

  sequelize.addModels([
    AdmProductModel,
    ProductModel,
    ClientModel,
    TransactionModel,
    InvoiceModel,
    InvoiceItemModel,
    OrderModel,
    OrderItemModel,
  ]);
  await sequelize.sync();
}

export { sequelize, migration, setupDb };

import express, { Express } from "express";
import { setupDb } from "../db/setup.database";
import { productRoute } from "./routes/product.route";
import { clientRoute } from "./routes/client.route";

export const app: Express = express();
app.use(express.json());
app.use("/products", productRoute);
app.use("/clients", clientRoute);

setupDb();

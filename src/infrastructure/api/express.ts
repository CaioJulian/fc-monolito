import express, { Express } from "express";
import { productRoute } from "./routes/product.route";
import { setupDb } from "../db/setup.database";

export const app: Express = express();
app.use(express.json());
app.use("/products", productRoute);

setupDb();

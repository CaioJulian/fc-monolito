import express, { Request, Response } from "express";
import ProductAdmFacadeFactory from "../../../modules/product-adm/factory/facade.factory";

export const productRoute = express.Router();

productRoute.post("/", (req: Request, res: Response) => {
  const productAdmFacade = ProductAdmFacadeFactory.create();
  productAdmFacade
    .addProduct(req.body)
    .then((product) => res.status(201).json(product))
    .catch((error) => res.status(400).json({ error: error.message }));
});

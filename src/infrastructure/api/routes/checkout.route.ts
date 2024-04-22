import express, { Request, Response } from "express";
import CheckoutFacadeFactory from "../../../modules/checkout/factory/checkout.facade.factory";

export const checkoutRoute = express.Router();

checkoutRoute.post("/", async (req: Request, res: Response) => {
  const checkoutFacade = CheckoutFacadeFactory.create();
  checkoutFacade
    .placeOrder(req.body)
    .then((result) => res.status(201).send(result))
    .catch((error) => res.status(400).json({ error: error.message }));
});

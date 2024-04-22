import express, { Request, Response } from "express";
import InvoiceFacadeFactory from "../../../modules/invoice/factory/invoice.facade.factory";

export const invoiceRoute = express.Router();

invoiceRoute.get("/:invoiceId", async (req: Request, res: Response) => {
  const invoiceFacade = InvoiceFacadeFactory.create();

  invoiceFacade
    .find({ id: req.params.invoiceId })
    .then((invoice) => res.status(200).send(invoice))
    .catch((error) => res.status(400).json({ error: error.message }));
});

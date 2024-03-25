import express, { Request, Response } from "express";
import ClientAdmFacadeFactory from "../../../modules/client-adm/factory/client-adm.facade.factory";

export const clientRoute = express.Router();

clientRoute.post("/", (req: Request, res: Response) => {
  const clientAdmFacade = ClientAdmFacadeFactory.create();
  clientAdmFacade
    .add(req.body)
    .then((_) => res.status(201).send())
    .catch((error) => res.status(400).json({ error: error.message }));
});

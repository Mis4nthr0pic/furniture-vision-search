import { Router } from "express";
import { getCatalogMeta } from "../catalog/load.js";

export const adminRouter = Router();

adminRouter.get("/catalog-meta", (_req, res) => {
  const meta = getCatalogMeta();
  res.json(meta);
});

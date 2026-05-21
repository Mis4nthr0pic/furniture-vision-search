import { Router } from "express";
import { getAppState } from "../app/state.js";
import { CatalogService } from "../services/catalog.service.js";

export const adminRouter = Router();

adminRouter.get("/catalog-meta", (_req, res) => {
  const meta = CatalogService.getMeta(getAppState());
  res.json(meta);
});

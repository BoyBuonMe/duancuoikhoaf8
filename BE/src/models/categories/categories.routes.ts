import { Router } from "express";
import * as categoriesController from "@/models/categories/categories.controller";

const router = Router();

router.get("/", categoriesController.getCategories);

export default router;

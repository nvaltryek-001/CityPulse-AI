import { Router } from "express";
import { analyzeImages } from "../controllers/aiController.js";

const router = Router();

router.post("/analyze", analyzeImages);

export default router;

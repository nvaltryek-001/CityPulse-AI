import { Router } from "express";

import {
  getSharePayload
} from "../controllers/shareController.js";

const router = Router();

router.get(
  "/:reportId",
  getSharePayload
);

export default router;

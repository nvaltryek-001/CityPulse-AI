import express from "express";

import {
  syncReportGeo
} from "../controllers/geoSyncController.js";

const router =
  express.Router();

router.post(
  "/:reportId",
  syncReportGeo
);

export default router;

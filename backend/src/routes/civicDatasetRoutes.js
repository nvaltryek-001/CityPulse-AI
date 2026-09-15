import express from "express";

import {
  getCivicDataset,
  getCivicDatasetAnalytics
} from "../controllers/civicDatasetController.js";

const router = express.Router();

router.get(
  "/",
  getCivicDataset
);

router.get(
  "/analytics",
  getCivicDatasetAnalytics
);

export default router;
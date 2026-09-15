import express from "express";

import {
  getNearbyIssues,
  getNearbyIssueStats
} from "../controllers/nearbyIssueController.js";

const router =
  express.Router();

router.get(
  "/",
  getNearbyIssues
);

router.get(
  "/stats",
  getNearbyIssueStats
);

export default router;

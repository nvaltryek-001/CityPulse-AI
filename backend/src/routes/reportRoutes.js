import { validateGpsPayload } from "../middleware/validateGps.js";
import { Router } from "express";

import {
  createReportController,
  listReports,
  getReport,
  patchReport,
  removeReport
} from "../controllers/reportController.js";

const router = Router();

router.post(
  "/",
  validateGpsPayload,
  createReportController
);

router.get(
  "/",
  listReports
);

// IMPORTANT: static route must come before /:reportId
router.get(
  "/nearby",
  async (req, res, next) => {
    try {
      const { getNearbyIssues } = await import(
        "../controllers/nearbyIssueController.js"
      );

      return getNearbyIssues(req, res, next);
    } catch (error) {
      return next(error);
    }
  }
);

router.get(
  "/nearby/stats",
  async (req, res, next) => {
    try {
      const { getNearbyIssueStats } = await import(
        "../controllers/nearbyIssueController.js"
      );

      return getNearbyIssueStats(req, res, next);
    } catch (error) {
      return next(error);
    }
  }
);

router.get(
  "/:reportId",
  getReport
);

router.patch(
  "/:reportId",
  patchReport
);

router.delete(
  "/:reportId",
  removeReport
);

export default router;
import express from "express";

import {
  getExploreDataController
} from "../controllers/exploreDataController.js";

const router =
  express.Router();

router.get(
  "/",
  getExploreDataController
);

export default router;

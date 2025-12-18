import { Router } from "express";
import {
  allPlans,
  filteredPlans,
  planSearch,
  recommendation,
} from "../controllers/planController";

const router = Router();

router.get("/", allPlans);
router.get("/filtered", filteredPlans);
router.get("/search", planSearch);
router.get("/recommendation", recommendation);

export default router;

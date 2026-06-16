import { Router } from "express";
import {
  getDashboardSummary,
  getResultsByDimension,
  getEvaluationsByGrade,
} from "../controllers/dashboard.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/summary",
  authMiddleware,
  roleMiddleware(["Administrador", "Docente", "Orientador"]),
  getDashboardSummary
);

router.get(
  "/by-dimension",
  authMiddleware,
  roleMiddleware(["Administrador", "Docente", "Orientador"]),
  getResultsByDimension
);

router.get(
  "/by-grade",
  authMiddleware,
  roleMiddleware(["Administrador", "Docente", "Orientador"]),
  getEvaluationsByGrade
);

export default router;
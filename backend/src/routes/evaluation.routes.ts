import { Router } from "express";
import {
  createEvaluation,
  getEvaluationById,
} from "../controllers/evaluation.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Administrador", "Docente"]),
  createEvaluation
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["Administrador", "Docente", "Orientador"]),
  getEvaluationById
);

export default router;
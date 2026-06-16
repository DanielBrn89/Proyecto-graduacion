import { Router } from "express";
import {
  getEvaluationReport,
  getStudentReport,
} from "../controllers/report.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/evaluation/:evaluationId",
  authMiddleware,
  roleMiddleware(["Administrador", "Docente", "Orientador"]),
  getEvaluationReport
);

router.get(
  "/student/:studentId",
  authMiddleware,
  roleMiddleware(["Administrador", "Docente", "Orientador"]),
  getStudentReport
);

export default router;
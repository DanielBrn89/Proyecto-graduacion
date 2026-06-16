import { Router } from "express";
import { getActiveQuestions } from "../controllers/question.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/active",
  authMiddleware,
  roleMiddleware(["Administrador", "Docente", "Orientador"]),
  getActiveQuestions
);

export default router;
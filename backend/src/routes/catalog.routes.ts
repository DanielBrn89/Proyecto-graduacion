import { Router } from "express";
import { getGrades, getSections } from "../controllers/catalog.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/grades",
  authMiddleware,
  roleMiddleware(["Administrador", "Docente", "Orientador"]),
  getGrades
);

router.get(
  "/sections",
  authMiddleware,
  roleMiddleware(["Administrador", "Docente", "Orientador"]),
  getSections
);

export default router;
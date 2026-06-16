import { Router } from "express";
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  changeStudentStatus,
} from "../controllers/student.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["Administrador", "Docente", "Orientador"]),
  getStudents
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["Administrador", "Docente", "Orientador"]),
  getStudentById
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Administrador", "Docente"]),
  createStudent
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["Administrador", "Docente"]),
  updateStudent
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["Administrador"]),
  changeStudentStatus
);

export default router;
import { Router } from "express";
import {
  getUsers,
  getRoles,
  createUser,
  changeUserStatus,
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["Administrador", "Superadministrador", "Director"]),
  getUsers
);

router.get(
  "/roles",
  authMiddleware,
  roleMiddleware(["Administrador", "Superadministrador", "Director"]),
  getRoles
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Administrador", "Superadministrador"]),
  createUser
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["Administrador", "Superadministrador"]),
  changeUserStatus
);

export default router;
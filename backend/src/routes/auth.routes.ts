import { Router } from "express";
import { login, profile } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", login);
router.get("/profile", authMiddleware, profile);

export default router;
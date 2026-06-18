import { Router } from "express";
import authRoutes from "./auth.routes";
import studentRoutes from "./student.routes";
import questionRoutes from "./question.routes";
import evaluationRoutes from "./evaluation.routes";
import reportRoutes from "./report.routes";
import dashboardRoutes from "./dashboard.routes";
import catalogRoutes from "./catalog.routes";
import userRoutes from "./user.routes";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API activa",
  });
});

router.use("/auth", authRoutes);
router.use("/students", studentRoutes);
router.use("/questions", questionRoutes);
router.use("/evaluations", evaluationRoutes);
router.use("/reports", reportRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/catalogs", catalogRoutes);
router.use("/users", userRoutes);

export default router;
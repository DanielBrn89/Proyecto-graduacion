import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export async function getDashboardSummary(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const totalStudents = await prisma.student.count();

    const activeStudents = await prisma.student.count({
      where: {
        status: true,
      },
    });

    const inactiveStudents = await prisma.student.count({
      where: {
        status: false,
      },
    });

    const totalEvaluations = await prisma.evaluation.count();

    const totalQuestions = await prisma.question.count({
      where: {
        status: true,
      },
    });

    const totalUsers = await prisma.user.count({
      where: {
        status: true,
      },
    });

    return res.json({
      title: "Resumen general del dashboard",
      data: {
        totalStudents,
        activeStudents,
        inactiveStudents,
        totalEvaluations,
        totalQuestions,
        totalUsers,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getResultsByDimension(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const dimensions = await prisma.dimension.findMany({
      orderBy: {
        id: "asc",
      },
    });

    const totalResultsByDimension = await prisma.evaluationResult.groupBy({
      by: ["dimensionId"],
      _count: {
        id: true,
      },
    });

    const lowResultsByDimension = await prisma.evaluationResult.groupBy({
      by: ["dimensionId"],
      where: {
        level: "Bajo",
      },
      _count: {
        id: true,
      },
    });

    const mediumResultsByDimension = await prisma.evaluationResult.groupBy({
      by: ["dimensionId"],
      where: {
        level: "Medio",
      },
      _count: {
        id: true,
      },
    });

    const highResultsByDimension = await prisma.evaluationResult.groupBy({
      by: ["dimensionId"],
      where: {
        level: "Alto",
      },
      _count: {
        id: true,
      },
    });

    const data = dimensions.map((dimension) => {
      const total =
        totalResultsByDimension.find(
          (item) => item.dimensionId === dimension.id
        )?._count.id || 0;

      const low =
        lowResultsByDimension.find(
          (item) => item.dimensionId === dimension.id
        )?._count.id || 0;

      const medium =
        mediumResultsByDimension.find(
          (item) => item.dimensionId === dimension.id
        )?._count.id || 0;

      const high =
        highResultsByDimension.find(
          (item) => item.dimensionId === dimension.id
        )?._count.id || 0;

      const lowPercentage = total > 0 ? Number(((low / total) * 100).toFixed(2)) : 0;

      return {
        dimensionId: dimension.id,
        dimension: dimension.name,
        totalEvaluatedResults: total,
        lowLevel: low,
        mediumLevel: medium,
        highLevel: high,
        lowPercentage,
      };
    });

    return res.json({
      title: "Resultados por dimensión",
      note: "Los porcentajes representan resultados preliminares y orientativos.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getEvaluationsByGrade(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const grades = await prisma.grade.findMany({
      include: {
        students: {
          include: {
            evaluations: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    const data = grades.map((grade) => {
      const totalStudents = grade.students.length;

      const totalEvaluations = grade.students.reduce(
        (total, student) => total + student.evaluations.length,
        0
      );

      return {
        gradeId: grade.id,
        grade: grade.name,
        level: grade.level,
        totalStudents,
        totalEvaluations,
      };
    });

    return res.json({
      title: "Evaluaciones por grado",
      data,
    });
  } catch (error) {
    next(error);
  }
}
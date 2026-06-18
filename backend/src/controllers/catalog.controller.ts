import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export async function getGrades(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const grades = await prisma.grade.findMany({
      where: {
        status: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return res.json({
      data: grades,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSections(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const gradeId = req.query.gradeId ? Number(req.query.gradeId) : undefined;

    const sections = await prisma.section.findMany({
      where: {
        status: true,
        gradeId,
      },
      include: {
        grade: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return res.json({
      data: sections,
    });
  } catch (error) {
    next(error);
  }
}
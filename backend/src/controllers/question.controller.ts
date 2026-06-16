import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export async function getActiveQuestions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const questions = await prisma.question.findMany({
      where: {
        status: true,
      },
      include: {
        dimension: true,
        indicator: true,
        theoreticalModel: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return res.json({
      data: questions,
    });
  } catch (error) {
    next(error);
  }
}
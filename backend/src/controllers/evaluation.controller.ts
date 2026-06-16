import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

type AnswerRequest = {
  questionId: number;
  answer: boolean;
};

function calculateLevel(percentage: number): string {
  if (percentage <= 40) return "Bajo";
  if (percentage <= 70) return "Medio";
  return "Alto";
}

function generateInterpretation(dimensionName: string, level: string): string {
  if (level === "Bajo") {
    return `El estudiante presenta posibles factores de atención en la dimensión ${dimensionName}.`;
  }

  if (level === "Medio") {
    return `El estudiante presenta un nivel intermedio en la dimensión ${dimensionName}, por lo que se recomienda seguimiento docente.`;
  }

  return `El estudiante muestra un nivel adecuado en la dimensión ${dimensionName}.`;
}

function generateRecommendation(dimensionName: string, level: string): string {
  if (level === "Bajo") {
    return `Se recomienda brindar seguimiento prioritario en la dimensión ${dimensionName} y revisar posibles apoyos educativos, familiares o motivacionales.`;
  }

  if (level === "Medio") {
    return `Se recomienda continuar observando el desempeño del estudiante en la dimensión ${dimensionName} y reforzar las áreas necesarias.`;
  }

  return `Se recomienda mantener las estrategias actuales y continuar fortaleciendo la dimensión ${dimensionName}.`;
}

export async function createEvaluation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number((req as any).user.id);

    const { studentId, answers, generalObservation } = req.body || {};

    if (!studentId || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        message: "El estudiante y las respuestas son obligatorios",
      });
    }

    const student = await prisma.student.findUnique({
      where: {
        id: Number(studentId),
      },
    });

    if (!student || !student.status) {
      return res.status(404).json({
        message: "El estudiante no existe o se encuentra inactivo",
      });
    }

    const activeQuestions = await prisma.question.findMany({
      where: {
        status: true,
      },
      include: {
        dimension: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    if (activeQuestions.length === 0) {
      return res.status(400).json({
        message: "No existen preguntas activas para aplicar la evaluación",
      });
    }

    if (answers.length !== activeQuestions.length) {
      return res.status(400).json({
        message: `Debe responder todas las preguntas activas. Preguntas requeridas: ${activeQuestions.length}`,
      });
    }

    const answerMap = new Map<number, boolean>();

    for (const item of answers as AnswerRequest[]) {
      if (typeof item.questionId !== "number") {
        return res.status(400).json({
          message: "Cada respuesta debe incluir un questionId numérico",
        });
      }

      if (typeof item.answer !== "boolean") {
        return res.status(400).json({
          message: "Cada respuesta debe ser true o false",
        });
      }

      answerMap.set(item.questionId, item.answer);
    }

    for (const question of activeQuestions) {
      if (!answerMap.has(question.id)) {
        return res.status(400).json({
          message: `Falta responder la pregunta con ID ${question.id}`,
        });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const evaluation = await tx.evaluation.create({
        data: {
          studentId: Number(studentId),
          userId,
          generalObservation,
          finalNote:
            "Resultado preliminar y orientativo. No sustituye una evaluación profesional.",
        },
      });

      const dimensionResults: Record<
        number,
        {
          dimensionId: number;
          dimensionName: string;
          totalQuestions: number;
          obtainedScore: number;
        }
      > = {};

      const answerRows = activeQuestions.map((question) => {
        const selectedAnswer = answerMap.get(question.id) as boolean;

        const score = question.expectedPositive
          ? selectedAnswer
            ? 1
            : 0
          : selectedAnswer
          ? 0
          : 1;

        if (!dimensionResults[question.dimensionId]) {
          dimensionResults[question.dimensionId] = {
            dimensionId: question.dimensionId,
            dimensionName: question.dimension.name,
            totalQuestions: 0,
            obtainedScore: 0,
          };
        }

        dimensionResults[question.dimensionId].totalQuestions += 1;
        dimensionResults[question.dimensionId].obtainedScore += score;

        return {
          evaluationId: evaluation.id,
          questionId: question.id,
          answer: selectedAnswer,
          score,
        };
      });

      await tx.answer.createMany({
        data: answerRows,
      });

      const resultRows = Object.values(dimensionResults).map((dimension) => {
        const percentage =
          (dimension.obtainedScore / dimension.totalQuestions) * 100;

        const level = calculateLevel(percentage);

        return {
          evaluationId: evaluation.id,
          dimensionId: dimension.dimensionId,
          totalQuestions: dimension.totalQuestions,
          obtainedScore: dimension.obtainedScore,
          percentage: Number(percentage.toFixed(2)),
          level,
          interpretation: generateInterpretation(
            dimension.dimensionName,
            level
          ),
          recommendation: generateRecommendation(
            dimension.dimensionName,
            level
          ),
        };
      });

      await tx.evaluationResult.createMany({
        data: resultRows,
      });

      const fullEvaluation = await tx.evaluation.findUnique({
        where: {
          id: evaluation.id,
        },
        include: {
          student: {
            include: {
              grade: true,
              section: true,
            },
          },
          user: {
            include: {
              role: true,
            },
          },
          answers: {
            include: {
              question: {
                include: {
                  dimension: true,
                  indicator: true,
                  theoreticalModel: true,
                },
              },
            },
          },
          results: {
            include: {
              dimension: true,
            },
          },
        },
      });

      return fullEvaluation;
    });

    return res.status(201).json({
      message: "Evaluación registrada correctamente",
      note: "El resultado es preliminar y no sustituye una evaluación profesional.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getEvaluationById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);

    const evaluation = await prisma.evaluation.findUnique({
      where: {
        id,
      },
      include: {
        student: {
          include: {
            grade: true,
            section: true,
          },
        },
        user: {
          include: {
            role: true,
          },
        },
        answers: {
          include: {
            question: {
              include: {
                dimension: true,
                indicator: true,
                theoreticalModel: true,
              },
            },
          },
        },
        results: {
          include: {
            dimension: true,
          },
        },
      },
    });

    if (!evaluation) {
      return res.status(404).json({
        message: "Evaluación no encontrada",
      });
    }

    return res.json({
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
}
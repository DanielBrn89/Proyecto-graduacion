import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export async function getEvaluationReport(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const evaluationId = Number(req.params.evaluationId);

    const evaluation = await prisma.evaluation.findUnique({
      where: {
        id: evaluationId,
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
        results: {
          include: {
            dimension: true,
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
      },
    });

    if (!evaluation) {
      return res.status(404).json({
        message: "Reporte de evaluación no encontrado",
      });
    }

    return res.json({
      title: "Reporte preliminar de evaluación",
      note: "Los resultados son preliminares y orientativos. No constituyen un diagnóstico clínico, psicológico ni pedagógico definitivo.",
      data: {
        evaluationId: evaluation.id,
        evaluationDate: evaluation.evaluationDate,
        generalObservation: evaluation.generalObservation,
        finalNote: evaluation.finalNote,
        student: {
          id: evaluation.student.id,
          code: evaluation.student.studentCode,
          fullName: evaluation.student.fullName,
          age: evaluation.student.age,
          grade: evaluation.student.grade.name,
          section: evaluation.student.section.name,
          guardianName: evaluation.student.guardianName,
          guardianPhone: evaluation.student.guardianPhone,
        },
        evaluatedBy: {
          id: evaluation.user.id,
          name: evaluation.user.name,
          email: evaluation.user.email,
          role: evaluation.user.role.name,
        },
        resultsByDimension: evaluation.results.map((result) => ({
          dimension: result.dimension.name,
          totalQuestions: result.totalQuestions,
          obtainedScore: result.obtainedScore,
          percentage: result.percentage,
          level: result.level,
          interpretation: result.interpretation,
          recommendation: result.recommendation,
        })),
        answers: evaluation.answers.map((answer) => ({
          questionId: answer.question.id,
          questionText: answer.question.questionText,
          answer: answer.answer ? "Sí" : "No",
          score: answer.score,
          dimension: answer.question.dimension.name,
          indicator: answer.question.indicator?.name || null,
          theoreticalModel: answer.question.theoreticalModel?.name || null,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getStudentReport(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const studentId = Number(req.params.studentId);

    const student = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
      include: {
        grade: true,
        section: true,
        evaluations: {
          orderBy: {
            evaluationDate: "desc",
          },
          include: {
            user: {
              include: {
                role: true,
              },
            },
            results: {
              include: {
                dimension: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        message: "Estudiante no encontrado",
      });
    }

    return res.json({
      title: "Reporte histórico del estudiante",
      note: "Los resultados son preliminares y orientativos. No sustituyen una evaluación profesional.",
      data: {
        student: {
          id: student.id,
          code: student.studentCode,
          fullName: student.fullName,
          age: student.age,
          grade: student.grade.name,
          section: student.section.name,
          guardianName: student.guardianName,
          guardianPhone: student.guardianPhone,
          status: student.status,
          generalObservations: student.generalObservations,
        },
        totalEvaluations: student.evaluations.length,
        evaluations: student.evaluations.map((evaluation) => ({
          evaluationId: evaluation.id,
          evaluationDate: evaluation.evaluationDate,
          evaluatedBy: {
            name: evaluation.user.name,
            role: evaluation.user.role.name,
          },
          generalObservation: evaluation.generalObservation,
          finalNote: evaluation.finalNote,
          resultsByDimension: evaluation.results.map((result) => ({
            dimension: result.dimension.name,
            percentage: result.percentage,
            level: result.level,
            interpretation: result.interpretation,
            recommendation: result.recommendation,
          })),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}
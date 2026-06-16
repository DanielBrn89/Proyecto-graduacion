import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export async function getStudents(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const students = await prisma.student.findMany({
      include: {
        grade: true,
        section: true,
      },
      orderBy: {
        fullName: "asc",
      },
    });

    return res.json({
      data: students,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStudentById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        grade: true,
        section: true,
        evaluations: {
          orderBy: {
            evaluationDate: "desc",
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
      data: student,
    });
  } catch (error) {
    next(error);
  }
}

export async function createStudent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      studentCode,
      fullName,
      age,
      gradeId,
      sectionId,
      guardianName,
      guardianPhone,
      generalObservations,
    } = req.body || {};

    if (
      !studentCode ||
      !fullName ||
      !age ||
      !gradeId ||
      !sectionId ||
      !guardianName
    ) {
      return res.status(400).json({
        message:
          "Código, nombre, edad, grado, sección y encargado son obligatorios",
      });
    }

    if (age < 4 || age > 12) {
      return res.status(400).json({
        message: "La edad del estudiante debe estar entre 4 y 12 años",
      });
    }

    const existingStudent = await prisma.student.findUnique({
      where: {
        studentCode,
      },
    });

    if (existingStudent) {
      return res.status(409).json({
        message: "Ya existe un estudiante con ese código",
      });
    }

    const grade = await prisma.grade.findUnique({
      where: {
        id: Number(gradeId),
      },
    });

    if (!grade) {
      return res.status(404).json({
        message: "El grado seleccionado no existe",
      });
    }

    const section = await prisma.section.findUnique({
      where: {
        id: Number(sectionId),
      },
    });

    if (!section) {
      return res.status(404).json({
        message: "La sección seleccionada no existe",
      });
    }

    const student = await prisma.student.create({
      data: {
        studentCode,
        fullName,
        age: Number(age),
        gradeId: Number(gradeId),
        sectionId: Number(sectionId),
        guardianName,
        guardianPhone,
        generalObservations,
        status: true,
      },
      include: {
        grade: true,
        section: true,
      },
    });

    return res.status(201).json({
      message: "Estudiante registrado correctamente",
      data: student,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStudent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);

    const {
      studentCode,
      fullName,
      age,
      gradeId,
      sectionId,
      guardianName,
      guardianPhone,
      generalObservations,
    } = req.body || {};

    const studentExists = await prisma.student.findUnique({
      where: { id },
    });

    if (!studentExists) {
      return res.status(404).json({
        message: "Estudiante no encontrado",
      });
    }

    if (age && (age < 4 || age > 12)) {
      return res.status(400).json({
        message: "La edad del estudiante debe estar entre 4 y 12 años",
      });
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        studentCode,
        fullName,
        age: age ? Number(age) : undefined,
        gradeId: gradeId ? Number(gradeId) : undefined,
        sectionId: sectionId ? Number(sectionId) : undefined,
        guardianName,
        guardianPhone,
        generalObservations,
      },
      include: {
        grade: true,
        section: true,
      },
    });

    return res.json({
      message: "Estudiante actualizado correctamente",
      data: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
}

export async function changeStudentStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);

    const student = await prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      return res.status(404).json({
        message: "Estudiante no encontrado",
      });
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        status: !student.status,
      },
    });

    return res.json({
      message: updatedStudent.status
        ? "Estudiante activado correctamente"
        : "Estudiante desactivado correctamente",
      data: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
}
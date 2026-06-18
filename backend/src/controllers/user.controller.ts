import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.json({
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        roleId: user.roleId,
        status: user.status,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}

export async function getRoles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const roles = await prisma.role.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return res.json({
      data: roles,
    });
  } catch (error) {
    next(error);
  }
}

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, email, password, roleId } = req.body || {};

    if (!name || !email || !password || !roleId) {
      return res.status(400).json({
        message: "Nombre, correo, contraseña y rol son obligatorios",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 8 caracteres",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Ya existe un usuario con ese correo electrónico",
      });
    }

    const role = await prisma.role.findUnique({
      where: {
        id: Number(roleId),
      },
    });

    if (!role) {
      return res.status(404).json({
        message: "El rol seleccionado no existe",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        roleId: Number(roleId),
        status: true,
      },
      include: {
        role: true,
      },
    });

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function changeUserStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        status: !user.status,
      },
      include: {
        role: true,
      },
    });

    return res.json({
      message: updatedUser.status
        ? "Usuario activado correctamente"
        : "Usuario desactivado correctamente",
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role.name,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    next(error);
  }
}
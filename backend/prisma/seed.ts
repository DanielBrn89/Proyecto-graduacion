import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Insertando datos iniciales...");

  // 1. Roles
  const adminRole = await prisma.role.upsert({
    where: { name: "Administrador" },
    update: {},
    create: {
      name: "Administrador",
      description: "Usuario con acceso completo al sistema",
    },
  });

  await prisma.role.upsert({
    where: { name: "Docente" },
    update: {},
    create: {
      name: "Docente",
      description: "Usuario encargado de aplicar cuestionarios y consultar estudiantes",
    },
  });

  await prisma.role.upsert({
    where: { name: "Orientador" },
    update: {},
    create: {
      name: "Orientador",
      description: "Usuario encargado de consultar resultados y reportes preliminares",
    },
  });

  // 2. Usuario administrador inicial
  const passwordHash = await bcrypt.hash("Admin123*", 10);

  await prisma.user.upsert({
    where: { email: "admin@eduorienta.com" },
    update: {},
    create: {
      name: "Administrador del Sistema",
      email: "admin@eduorienta.com",
      passwordHash,
      roleId: adminRole.id,
      status: true,
    },
  });

  // 3. Grados
  const primero = await prisma.grade.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Primero Primaria",
      level: "Primaria",
      status: true,
    },
  });

  const segundo = await prisma.grade.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: "Segundo Primaria",
      level: "Primaria",
      status: true,
    },
  });

  const tercero = await prisma.grade.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: "Tercero Primaria",
      level: "Primaria",
      status: true,
    },
  });

  // 4. Secciones
  await prisma.section.upsert({
    where: {
      name_gradeId: {
        name: "A",
        gradeId: primero.id,
      },
    },
    update: {},
    create: {
      name: "A",
      gradeId: primero.id,
      status: true,
    },
  });

  await prisma.section.upsert({
    where: {
      name_gradeId: {
        name: "A",
        gradeId: segundo.id,
      },
    },
    update: {},
    create: {
      name: "A",
      gradeId: segundo.id,
      status: true,
    },
  });

  await prisma.section.upsert({
    where: {
      name_gradeId: {
        name: "A",
        gradeId: tercero.id,
      },
    },
    update: {},
    create: {
      name: "A",
      gradeId: tercero.id,
      status: true,
    },
  });

  // 5. Modelos teóricos
  const bloom = await prisma.theoreticalModel.upsert({
    where: { name: "Taxonomía de Bloom" },
    update: {},
    create: {
      name: "Taxonomía de Bloom",
      description:
        "Modelo utilizado para analizar niveles cognitivos del aprendizaje: recordar, comprender, aplicar, analizar, evaluar y crear.",
    },
  });

  const maslow = await prisma.theoreticalModel.upsert({
    where: { name: "Jerarquía de Necesidades de Maslow" },
    update: {},
    create: {
      name: "Jerarquía de Necesidades de Maslow",
      description:
        "Modelo utilizado para analizar factores emocionales, motivacionales, sociales y de seguridad que influyen en el aprendizaje.",
    },
  });

  // 6. Dimensiones
  const cognitiva = await prisma.dimension.upsert({
    where: { name: "Cognitiva" },
    update: {},
    create: {
      name: "Cognitiva",
      description:
        "Evalúa aspectos relacionados con comprensión, memoria, aplicación y análisis del aprendizaje.",
    },
  });

  const emocional = await prisma.dimension.upsert({
    where: { name: "Emocional/Motivacional" },
    update: {},
    create: {
      name: "Emocional/Motivacional",
      description:
        "Evalúa aspectos relacionados con interés, participación, confianza y seguridad emocional.",
    },
  });

  const academica = await prisma.dimension.upsert({
    where: { name: "Académica" },
    update: {},
    create: {
      name: "Académica",
      description:
        "Evalúa cumplimiento de tareas, entrega de actividades y desempeño académico general.",
    },
  });

  const familiar = await prisma.dimension.upsert({
    where: { name: "Familiar" },
    update: {},
    create: {
      name: "Familiar",
      description:
        "Evalúa apoyo en casa, seguimiento del encargado y ambiente familiar para el estudio.",
    },
  });

  // 7. Indicadores
  const comprension = await prisma.indicator.create({
    data: {
      name: "Comprensión de instrucciones",
      dimensionId: cognitiva.id,
      theoreticalModelId: bloom.id,
      description: "Capacidad del estudiante para comprender instrucciones y contenidos.",
    },
  });

  const memoria = await prisma.indicator.create({
    data: {
      name: "Recuerdo de contenidos",
      dimensionId: cognitiva.id,
      theoreticalModelId: bloom.id,
      description: "Capacidad del estudiante para recordar contenidos vistos anteriormente.",
    },
  });

  const aplicacion = await prisma.indicator.create({
    data: {
      name: "Aplicación de conocimientos",
      dimensionId: cognitiva.id,
      theoreticalModelId: bloom.id,
      description: "Capacidad para aplicar lo aprendido en actividades prácticas.",
    },
  });

  const motivacion = await prisma.indicator.create({
    data: {
      name: "Interés por aprender",
      dimensionId: emocional.id,
      theoreticalModelId: maslow.id,
      description: "Nivel de interés y disposición del estudiante hacia el aprendizaje.",
    },
  });

  const confianza = await prisma.indicator.create({
    data: {
      name: "Confianza y seguridad",
      dimensionId: emocional.id,
      theoreticalModelId: maslow.id,
      description: "Confianza del estudiante al participar y realizar actividades.",
    },
  });

  const tareas = await prisma.indicator.create({
    data: {
      name: "Cumplimiento de tareas",
      dimensionId: academica.id,
      theoreticalModelId: null,
      description: "Nivel de cumplimiento de tareas y actividades asignadas.",
    },
  });

  const apoyoCasa = await prisma.indicator.create({
    data: {
      name: "Apoyo en casa",
      dimensionId: familiar.id,
      theoreticalModelId: maslow.id,
      description: "Seguimiento y apoyo que recibe el estudiante en el hogar.",
    },
  });

  // 8. Preguntas base
  const questions = [
    {
      questionText: "¿El estudiante comprende instrucciones dadas por el docente?",
      dimensionId: cognitiva.id,
      indicatorId: comprension.id,
      theoreticalModelId: bloom.id,
    },
    {
      questionText: "¿El estudiante recuerda contenidos vistos anteriormente?",
      dimensionId: cognitiva.id,
      indicatorId: memoria.id,
      theoreticalModelId: bloom.id,
    },
    {
      questionText: "¿El estudiante explica con sus propias palabras lo aprendido?",
      dimensionId: cognitiva.id,
      indicatorId: comprension.id,
      theoreticalModelId: bloom.id,
    },
    {
      questionText: "¿El estudiante aplica los conocimientos en actividades prácticas?",
      dimensionId: cognitiva.id,
      indicatorId: aplicacion.id,
      theoreticalModelId: bloom.id,
    },
    {
      questionText: "¿El estudiante relaciona ideas o conceptos entre sí?",
      dimensionId: cognitiva.id,
      indicatorId: aplicacion.id,
      theoreticalModelId: bloom.id,
    },

    {
      questionText: "¿El estudiante muestra interés por aprender?",
      dimensionId: emocional.id,
      indicatorId: motivacion.id,
      theoreticalModelId: maslow.id,
    },
    {
      questionText: "¿El estudiante participa activamente en clase?",
      dimensionId: emocional.id,
      indicatorId: motivacion.id,
      theoreticalModelId: maslow.id,
    },
    {
      questionText: "¿El estudiante demuestra confianza al realizar actividades?",
      dimensionId: emocional.id,
      indicatorId: confianza.id,
      theoreticalModelId: maslow.id,
    },
    {
      questionText: "¿El estudiante se relaciona adecuadamente con sus compañeros?",
      dimensionId: emocional.id,
      indicatorId: confianza.id,
      theoreticalModelId: maslow.id,
    },
    {
      questionText: "¿El estudiante expresa sus ideas con seguridad?",
      dimensionId: emocional.id,
      indicatorId: confianza.id,
      theoreticalModelId: maslow.id,
    },

    {
      questionText: "¿El estudiante entrega tareas con frecuencia?",
      dimensionId: academica.id,
      indicatorId: tareas.id,
      theoreticalModelId: null,
    },
    {
      questionText: "¿El estudiante cumple con las actividades asignadas?",
      dimensionId: academica.id,
      indicatorId: tareas.id,
      theoreticalModelId: null,
    },
    {
      questionText: "¿El estudiante finaliza las actividades en el tiempo indicado?",
      dimensionId: academica.id,
      indicatorId: tareas.id,
      theoreticalModelId: null,
    },
    {
      questionText: "¿El estudiante mantiene calificaciones satisfactorias?",
      dimensionId: academica.id,
      indicatorId: tareas.id,
      theoreticalModelId: null,
    },

    {
      questionText: "¿El estudiante recibe apoyo en casa para realizar tareas?",
      dimensionId: familiar.id,
      indicatorId: apoyoCasa.id,
      theoreticalModelId: maslow.id,
    },
    {
      questionText: "¿El encargado da seguimiento al rendimiento académico del estudiante?",
      dimensionId: familiar.id,
      indicatorId: apoyoCasa.id,
      theoreticalModelId: maslow.id,
    },
    {
      questionText: "¿El estudiante cuenta con un ambiente adecuado para estudiar?",
      dimensionId: familiar.id,
      indicatorId: apoyoCasa.id,
      theoreticalModelId: maslow.id,
    },
    {
      questionText: "¿El encargado mantiene comunicación con el docente?",
      dimensionId: familiar.id,
      indicatorId: apoyoCasa.id,
      theoreticalModelId: maslow.id,
    },
  ];

  for (const question of questions) {
    await prisma.question.create({
      data: {
        ...question,
        expectedPositive: true,
        status: true,
      },
    });
  }

  console.log("Datos iniciales insertados correctamente.");
  console.log("Usuario administrador:");
  console.log("Correo: admin@eduorienta.com");
  console.log("Contraseña: Admin123*");
}

main()
  .catch((error) => {
    console.error("Error insertando datos iniciales:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
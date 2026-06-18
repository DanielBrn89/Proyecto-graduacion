import { useEffect, useRef, useState } from "react";
import { api } from "../../services/api";

type Student = {
  id: number;
  studentCode: string;
  fullName: string;
  age: number;
  status: boolean;
  grade: {
    id: number;
    name: string;
  };
  section: {
    id: number;
    name: string;
  };
};

type ResultByDimension = {
  dimension: string;
  percentage: string | number;
  level: string;
  interpretation: string;
  recommendation: string;
};

type Evaluation = {
  evaluationId: number;
  evaluationDate: string;
  generalObservation: string | null;
  finalNote: string | null;
  evaluatedBy: {
    name: string;
    role: string;
  };
  resultsByDimension: ResultByDimension[];
};

type StudentReport = {
  student: {
    id: number;
    code: string;
    fullName: string;
    age: number;
    grade: string;
    section: string;
    guardianName: string;
    guardianPhone: string | null;
    status: boolean;
    generalObservations: string | null;
  };
  totalEvaluations: number;
  evaluations: Evaluation[];
};

export function ReportsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [report, setReport] = useState<StudentReport | null>(null);

  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState("");

  const reportRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    window.print();
  }


  async function loadStudents() {
    try {
      const response = await api.get("/students");
      setStudents(response.data.data);
    } catch {
      setError("No se pudieron cargar los estudiantes.");
    } finally {
      setLoadingStudents(false);
    }
  }

  async function loadStudentReport(studentId: string) {
    try {
      setLoadingReport(true);
      setError("");
      setReport(null);

      const response = await api.get(`/reports/student/${studentId}`);
      setReport(response.data.data);
    } catch {
      setError("No se pudo cargar el reporte del estudiante.");
    } finally {
      setLoadingReport(false);
    }
  }

  useEffect(() => {
    const fetchStudents = async () => {
      await loadStudents();
    };

    void fetchStudents();
  }, []);

  function handleStudentChange(studentId: string) {
    setSelectedStudentId(studentId);

    if (studentId) {
      loadStudentReport(studentId);
    } else {
      setReport(null);
    }
  }

  if (loadingStudents) {
    return <p className="text-gray-600">Cargando reportes...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 no-print">
        <div>
        <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
        <p className="text-gray-600">
            Consulta el historial de evaluaciones preliminares por estudiante.
        </p>
    </div>

    {report && (
        <button
        onClick={handlePrint}
        className="bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2 rounded-lg"
        >
         Exportar PDF
     </button>
        )}
    </div>

      {error && (
        <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <section className="bg-white rounded-xl shadow p-6 mb-6 no-print">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Seleccionar estudiante
        </label>

        <select
          value={selectedStudentId}
          onChange={(event) => handleStudentChange(event.target.value)}
          className="input"
        >
          <option value="">Seleccione un estudiante</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.studentCode} - {student.fullName} - {student.grade.name}{" "}
              {student.section.name}
            </option>
          ))}
        </select>
      </section>

      {loadingReport && (
        <p className="text-gray-600">Cargando reporte del estudiante...</p>
      )}

      {report && (
        <div ref={reportRef} className="space-y-6 print-area">
          <section className="bg-white rounded-xl shadow p-6 border-l-4 border-green-700">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Datos del estudiante
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <Info label="Código" value={report.student.code} />
              <Info label="Nombre" value={report.student.fullName} />
              <Info label="Edad" value={`${report.student.age} años`} />
              <Info label="Grado" value={report.student.grade} />
              <Info label="Sección" value={report.student.section} />
              <Info label="Encargado" value={report.student.guardianName} />
              <Info
                label="Teléfono"
                value={report.student.guardianPhone || "No registrado"}
              />
              <Info
                label="Evaluaciones realizadas"
                value={String(report.totalEvaluations)}
              />
              <Info
                label="Estado"
                value={report.student.status ? "Activo" : "Inactivo"}
              />
            </div>

            {report.student.generalObservations && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700">
                  Observaciones generales:
                </p>
                <p className="text-sm text-gray-600">
                  {report.student.generalObservations}
                </p>
              </div>
            )}
          </section>

          {report.evaluations.length === 0 ? (
            <section className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-600">
                Este estudiante aún no tiene evaluaciones registradas.
              </p>
            </section>
          ) : (
            report.evaluations.map((evaluation) => (
              <section
                key={evaluation.evaluationId}
                className="bg-white rounded-xl shadow p-6"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-800">
                    Evaluación #{evaluation.evaluationId}
                  </h2>

                  <p className="text-sm text-gray-600">
                    Fecha:{" "}
                    {new Date(evaluation.evaluationDate).toLocaleString()}
                  </p>

                  <p className="text-sm text-gray-600">
                    Evaluado por: {evaluation.evaluatedBy.name} -{" "}
                    {evaluation.evaluatedBy.role}
                  </p>

                  {evaluation.generalObservation && (
                    <p className="text-sm text-gray-600 mt-2">
                      Observación: {evaluation.generalObservation}
                    </p>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse report-table">
                    <thead>
                      <tr className="bg-green-700 text-white">
                        <th className="p-3 text-left">Dimensión</th>
                        <th className="p-3 text-center">Porcentaje</th>
                        <th className="p-3 text-center">Nivel</th>
                        <th className="p-3 text-left">Interpretación</th>
                        <th className="p-3 text-left">Recomendación</th>
                      </tr>
                    </thead>

                    <tbody>
                      {evaluation.resultsByDimension.map((result) => (
                        <tr key={result.dimension} className="border-b">
                          <td className="p-3 font-medium">
                            {result.dimension}
                          </td>

                          <td className="p-3 text-center">
                            {result.percentage}%
                          </td>

                          <td className="p-3 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                result.level === "Bajo"
                                  ? "bg-red-100 text-red-700"
                                  : result.level === "Medio"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {result.level}
                            </span>
                          </td>

                          <td className="p-3">{result.interpretation}</td>
                          <td className="p-3">{result.recommendation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  {evaluation.finalNote ||
                    "Los resultados son preliminares y orientativos. No sustituyen una evaluación profesional."}
                </p>
              </section>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  );
}
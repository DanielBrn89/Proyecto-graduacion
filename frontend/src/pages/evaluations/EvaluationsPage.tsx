import { useEffect, useState } from "react";
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

type Question = {
  id: number;
  questionText: string;
  dimension: {
    id: number;
    name: string;
  };
  indicator: {
    id: number;
    name: string;
  } | null;
  theoreticalModel: {
    id: number;
    name: string;
  } | null;
};

type EvaluationResult = {
  id: number;
  percentage: string | number;
  level: string;
  interpretation: string;
  recommendation: string;
  dimension: {
    id: number;
    name: string;
  };
};

type EvaluationResponse = {
  id: number;
  evaluationDate: string;
  student: Student;
  results: EvaluationResult[];
};

export function EvaluationsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [generalObservation, setGeneralObservation] = useState("");
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [studentsResponse, questionsResponse] = await Promise.all([
          api.get("/students"),
          api.get("/questions/active"),
        ]);

        setStudents(studentsResponse.data.data);
        setQuestions(questionsResponse.data.data);
      } catch {
        setError("No se pudieron cargar los datos para la evaluación.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function handleAnswer(questionId: number, value: boolean) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setEvaluationResult(null);

      if (!selectedStudentId) {
        setError("Debe seleccionar un estudiante.");
        return;
      }

      if (Object.keys(answers).length !== questions.length) {
        setError("Debe responder todas las preguntas antes de guardar.");
        return;
      }

      const formattedAnswers = questions.map((question) => ({
        questionId: question.id,
        answer: answers[question.id],
      }));

      const response = await api.post("/evaluations", {
        studentId: Number(selectedStudentId),
        generalObservation,
        answers: formattedAnswers,
      });

      setEvaluationResult(response.data.data);
      setAnswers({});
      setGeneralObservation("");
    } catch {
      setError("No se pudo registrar la evaluación. Revisa los datos.");
    } finally {
      setSaving(false);
    }
  }

  const groupedQuestions = questions.reduce<Record<string, Question[]>>(
    (groups, question) => {
      const dimensionName = question.dimension.name;

      if (!groups[dimensionName]) {
        groups[dimensionName] = [];
      }

      groups[dimensionName].push(question);

      return groups;
    },
    {}
  );

  if (loading) {
    return <p className="text-gray-600">Cargando evaluación...</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Aplicar evaluación
        </h1>
        <p className="text-gray-600">
          Responde el cuestionario para generar un resultado preliminar por
          dimensión.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {evaluationResult && (
        <section className="bg-white rounded-xl shadow p-6 mb-6 border-l-4 border-green-700">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Evaluación registrada correctamente
          </h2>

          <p className="text-gray-600 mb-4">
            Estudiante:{" "}
            <span className="font-semibold">
              {evaluationResult.student.fullName}
            </span>
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="p-3 text-left">Dimensión</th>
                  <th className="p-3 text-center">Porcentaje</th>
                  <th className="p-3 text-center">Nivel</th>
                  <th className="p-3 text-left">Interpretación</th>
                </tr>
              </thead>

              <tbody>
                {evaluationResult.results.map((result) => (
                  <tr key={result.id} className="border-b">
                    <td className="p-3 font-medium">
                      {result.dimension.name}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Los resultados son preliminares y orientativos. No constituyen un
            diagnóstico clínico, psicológico ni pedagógico definitivo.
          </p>
        </section>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estudiante
            </label>

            <select
              value={selectedStudentId}
              onChange={(event) => setSelectedStudentId(event.target.value)}
              className="input"
              required
            >
              <option value="">Seleccione un estudiante</option>
              {students
                .filter((student) => student.status)
                .map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.studentCode} - {student.fullName} -{" "}
                    {student.grade.name} {student.section.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observación general
            </label>

            <input
              value={generalObservation}
              onChange={(event) =>
                setGeneralObservation(event.target.value)
              }
              className="input"
              placeholder="Observación preliminar de la evaluación"
            />
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedQuestions).map(
            ([dimensionName, dimensionQuestions]) => (
              <section
                key={dimensionName}
                className="border border-gray-200 rounded-xl p-4"
              >
                <h2 className="text-lg font-bold text-green-700 mb-4">
                  Dimensión {dimensionName}
                </h2>

                <div className="space-y-4">
                  {dimensionQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <p className="font-medium text-gray-800">
                        {question.questionText}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Indicador: {question.indicator?.name || "No definido"}
                      </p>

                      <div className="flex gap-3 mt-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={answers[question.id] === true}
                            onChange={() => handleAnswer(question.id, true)}
                          />
                          <span>Sí</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={answers[question.id] === false}
                            onChange={() => handleAnswer(question.id, false)}
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          )}
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={saving}
            className="bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2 rounded-lg disabled:opacity-60"
          >
            {saving ? "Guardando evaluación..." : "Guardar evaluación"}
          </button>
        </div>
      </form>
    </div>
  );
}
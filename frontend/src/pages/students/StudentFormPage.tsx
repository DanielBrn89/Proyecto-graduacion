import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

type Grade = {
  id: number;
  name: string;
  level: string;
};

type Section = {
  id: number;
  name: string;
  gradeId: number;
};

export function StudentFormPage() {
  const navigate = useNavigate();

  const [grades, setGrades] = useState<Grade[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const [studentCode, setStudentCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [generalObservations, setGeneralObservations] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchGrades() {
      const response = await api.get("/catalogs/grades");
      setGrades(response.data.data);
    }

    void fetchGrades();
  }, []);

  useEffect(() => {
    async function fetchSections() {
      if (!gradeId) {
        setSections([]);
        return;
      }

      const response = await api.get(`/catalogs/sections?gradeId=${gradeId}`);
      setSections(response.data.data);
    }

    void fetchSections().then(() => setSectionId(""));
  }, [gradeId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      await api.post("/students", {
        studentCode,
        fullName,
        age: Number(age),
        gradeId: Number(gradeId),
        sectionId: Number(sectionId),
        guardianName,
        guardianPhone,
        generalObservations,
      });

      navigate("/students");
    } catch {
      setError("No se pudo registrar el estudiante. Revisa los datos ingresados.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Nuevo estudiante</h1>
        <p className="text-gray-600">
          Registra la información básica del estudiante.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Código del estudiante">
            <input
              value={studentCode}
              onChange={(event) => setStudentCode(event.target.value)}
              className="input"
              placeholder="EST-002"
              required
            />
          </Field>

          <Field label="Nombre completo">
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="input"
              placeholder="Nombre completo del estudiante"
              required
            />
          </Field>

          <Field label="Edad">
            <input
              type="number"
              min="4"
              max="12"
              value={age}
              onChange={(event) => setAge(event.target.value)}
              className="input"
              placeholder="Edad"
              required
            />
          </Field>

          <Field label="Grado">
            <select
              value={gradeId}
              onChange={(event) => setGradeId(event.target.value)}
              className="input"
              required
            >
              <option value="">Seleccione un grado</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Sección">
            <select
              value={sectionId}
              onChange={(event) => setSectionId(event.target.value)}
              className="input"
              required
            >
              <option value="">Seleccione una sección</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Nombre del encargado">
            <input
              value={guardianName}
              onChange={(event) => setGuardianName(event.target.value)}
              className="input"
              placeholder="Nombre del encargado"
              required
            />
          </Field>

          <Field label="Teléfono del encargado">
            <input
              value={guardianPhone}
              onChange={(event) => setGuardianPhone(event.target.value)}
              className="input"
              placeholder="5555-0000"
            />
          </Field>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones generales
            </label>
            <textarea
              value={generalObservations}
              onChange={(event) => setGeneralObservations(event.target.value)}
              className="input min-h-24"
              placeholder="Observaciones generales del estudiante"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2 rounded-lg disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar estudiante"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/students")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-5 py-2 rounded-lg"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
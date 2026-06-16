import { useEffect, useState } from "react";
import { api } from "../../services/api";

type DashboardSummary = {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  totalEvaluations: number;
  totalQuestions: number;
  totalUsers: number;
};

type DimensionResult = {
  dimensionId: number;
  dimension: string;
  totalEvaluatedResults: number;
  lowLevel: number;
  mediumLevel: number;
  highLevel: number;
  lowPercentage: number;
};

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [dimensions, setDimensions] = useState<DimensionResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [summaryResponse, dimensionResponse] = await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/dashboard/by-dimension"),
        ]);

        setSummary(summaryResponse.data.data);
        setDimensions(dimensionResponse.data.data);
      } catch (error) {
        console.error("Error cargando dashboard", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <p className="text-gray-600">Cargando dashboard...</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">
          Resumen general de estudiantes, evaluaciones y resultados preliminares.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card title="Estudiantes registrados" value={summary?.totalStudents || 0} />
        <Card title="Estudiantes activos" value={summary?.activeStudents || 0} />
        <Card title="Evaluaciones realizadas" value={summary?.totalEvaluations || 0} />
        <Card title="Preguntas activas" value={summary?.totalQuestions || 0} />
        <Card title="Usuarios activos" value={summary?.totalUsers || 0} />
        <Card title="Estudiantes inactivos" value={summary?.inactiveStudents || 0} />
      </div>

      <section className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Resultados por dimensión
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="p-3 text-left">Dimensión</th>
                <th className="p-3 text-center">Nivel bajo</th>
                <th className="p-3 text-center">Nivel medio</th>
                <th className="p-3 text-center">Nivel alto</th>
                <th className="p-3 text-center">% bajo</th>
              </tr>
            </thead>

            <tbody>
              {dimensions.map((item) => (
                <tr key={item.dimensionId} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{item.dimension}</td>
                  <td className="p-3 text-center">{item.lowLevel}</td>
                  <td className="p-3 text-center">{item.mediumLevel}</td>
                  <td className="p-3 text-center">{item.highLevel}</td>
                  <td className="p-3 text-center">{item.lowPercentage}%</td>
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
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-700">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
    </div>
  );
}
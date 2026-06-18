import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Link } from "react-router-dom";

type Grade = {
  id: number;
  name: string;
  level: string;
};

type Section = {
  id: number;
  name: string;
};

type Student = {
  id: number;
  studentCode: string;
  fullName: string;
  age: number;
  guardianName: string;
  guardianPhone: string | null;
  generalObservations: string | null;
  status: boolean;
  grade: Grade;
  section: Section;
};

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      try {
        const response = await api.get("/students");
        setStudents(response.data.data);
      } catch (error) {
        console.error("Error cargando estudiantes", error);
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, []);

  if (loading) {
    return <p className="text-gray-600">Cargando estudiantes...</p>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Estudiantes</h1>
          <p className="text-gray-600">
            Gestión de estudiantes registrados en la plataforma.
          </p>
        </div>

       <Link
  to="/students/new"
  className="mt-4 md:mt-0 bg-green-700 hover:bg-green-800 text-white font-semibold px-4 py-2 rounded-lg"
>
  Nuevo estudiante
</Link>
      </div>

      <section className="bg-white rounded-xl shadow p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="p-3 text-left">Código</th>
                <th className="p-3 text-left">Nombre completo</th>
                <th className="p-3 text-center">Edad</th>
                <th className="p-3 text-left">Grado</th>
                <th className="p-3 text-center">Sección</th>
                <th className="p-3 text-left">Encargado</th>
                <th className="p-3 text-center">Estado</th>
              </tr>
            </thead>

            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    No hay estudiantes registrados.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{student.studentCode}</td>
                    <td className="p-3">{student.fullName}</td>
                    <td className="p-3 text-center">{student.age}</td>
                    <td className="p-3">{student.grade.name}</td>
                    <td className="p-3 text-center">{student.section.name}</td>
                    <td className="p-3">{student.guardianName}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          student.status
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {student.status ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-green-800 text-white hidden md:flex flex-col">
        <div className="p-5 border-b border-green-700">
          <h1 className="text-xl font-bold">EduOrienta Judá</h1>
          <p className="text-sm text-green-100 mt-1">
            Diagnóstico preliminar
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/dashboard"
            className="block px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Dashboard
          </Link>

          <Link
            to="/students"
            className="block px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Estudiantes
          </Link>

          <Link
            to="/evaluations"
            className="block px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Evaluaciones
          </Link>

          <Link
            to="/reports"
            className="block px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Reportes
          </Link>
        </nav>

        <div className="p-4 border-t border-green-700">
          <p className="text-sm font-semibold">{user?.name}</p>
          <p className="text-xs text-green-100">{user?.role}</p>

          <button
            onClick={handleLogout}
            className="mt-3 w-full bg-yellow-400 text-green-900 font-semibold py-2 rounded-lg hover:bg-yellow-300"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <header className="bg-white shadow px-6 py-4">
          <h2 className="font-semibold text-gray-700">
            Plataforma de apoyo educativo
          </h2>
        </header>

        <section className="p-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
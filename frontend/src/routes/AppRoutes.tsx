import { StudentsPage } from "../pages/students/StudentsPage";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/auth/LoginPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { MainLayout } from "../components/layout/MainLayout";
import { ProtectedRoute } from "./ProtectedRoute";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="bg-white rounded-xl shadow p-6">
      <h1 className="text-2xl font-bold text-green-700">{title}</h1>
      <p className="text-gray-600 mt-2">
        Este módulo será desarrollado en la siguiente fase.
      </p>
    </section>
  );
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="evaluations" element={<PlaceholderPage title="Evaluaciones" />} />
          <Route path="reports" element={<PlaceholderPage title="Reportes" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
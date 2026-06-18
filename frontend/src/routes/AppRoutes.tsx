import { StudentsPage } from "../pages/students/StudentsPage";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/auth/LoginPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { MainLayout } from "../components/layout/MainLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { StudentFormPage } from "../pages/students/StudentFormPage";
import { EvaluationsPage } from "../pages/evaluations/EvaluationsPage";
import { ReportsPage } from "../pages/reports/ReportsPage";
import { UsersPage } from "../pages/users/UsersPage";

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
         <Route path="evaluations" element={<EvaluationsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="students/new" element={<StudentFormPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
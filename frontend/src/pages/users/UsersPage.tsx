import { useEffect, useState } from "react";
import { api } from "../../services/api";

type Role = {
  id: number;
  name: string;
  description: string | null;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  roleId: number;
  status: boolean;
};

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Usuario123*");
  const [roleId, setRoleId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        api.get("/users"),
        api.get("/users/roles"),
      ]);

      setUsers(usersResponse.data.data);
      setRoles(rolesResponse.data.data);
    } catch {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function initialize() {
      await loadData();
    }

    void initialize();
  }, []);

  async function handleCreateUser(event: React.FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      await api.post("/users", {
        name,
        email,
        password,
        roleId: Number(roleId),
      });

      setName("");
      setEmail("");
      setPassword("Usuario123*");
      setRoleId("");

      await loadData();
    } catch {
      setError("No se pudo registrar el usuario. Verifica los datos.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangeStatus(userId: number) {
    try {
      await api.patch(`/users/${userId}/status`);
      await loadData();
    } catch {
      setError("No se pudo cambiar el estado del usuario.");
    }
  }

  if (loading) {
    return <p className="text-gray-600">Cargando usuarios...</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestión de usuarios
        </h1>
        <p className="text-gray-600">
          Administra los usuarios del sistema según su rol.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <section className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Crear nuevo usuario
        </h2>

        <form
          onSubmit={handleCreateUser}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nombre completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo
            </label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña temporal
            </label>
            <input
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              className="input"
              value={roleId}
              onChange={(event) => setRoleId(event.target.value)}
              required
            >
              <option value="">Seleccione rol</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2 rounded-lg disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Crear usuario"}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Usuarios registrados
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Correo</th>
                <th className="p-3 text-center">Rol</th>
                <th className="p-3 text-center">Estado</th>
                <th className="p-3 text-center">Acción</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3 text-center">{user.role}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleChangeStatus(user.id)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-lg text-xs font-semibold"
                    >
                      {user.status ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
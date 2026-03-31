import { useEffect, useState } from "react";
import apiService from "../services/api";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts";
import { FileText, AlertCircle, Users } from "lucide-react";

export default function Estadisticas() {

  const [data, setData] = useState(null);
  const [dashboard, setDashboard] = useState(null);

  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  useEffect(() => {
    loadStats();
    loadDashboard();
  }, []);

  const loadStats = async () => {
    try {
      const res = await apiService.request("/stats/multas");
      setData(res);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDashboard = async () => {
    try {
      const res = await apiService.request("/stats/dashboard");
      setDashboard(res);
    } catch (e) {
      console.error(e);
    }
  };

  if (!data || !dashboard) return <p className="p-6">Cargando estadísticas...</p>;

  const safeData = {
    si: data?.si || 0,
    no: data?.no || 0
  };

  const pieData = [
    { name: "Sí", value: safeData.si },
    { name: "No", value: safeData.no }
  ];

  const barData = [
    { name: "Multas", si: safeData.si, no: safeData.no }
  ];

  const totalMovimientos = Object.values(dashboard.areas || {}).reduce((a, b) => a + b, 0);

  const Card = ({ icon, value, label, color }) => (
    <div className="flex-1 flex items-center justify-center gap-4">
      <div className={`text-3xl ${color}`}>{icon}</div>
      <div>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500 uppercase">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-10">

      <h2 className="text-2xl font-bold">📊 Estadísticas</h2>

      {/* 🔥 DASHBOARD (NUEVO) */}
      <div className="bg-white rounded-xl shadow p-6 flex justify-between items-center">

        <Card
          icon={<FileText />}
          value={dashboard.totalExpedientes}
          label="Expedientes"
          color="text-blue-500"
        />

        <div className="w-px h-16 bg-gray-200" />

        <Card
          icon={<AlertCircle />}
          value={dashboard.totalDenuncias}
          label="Denuncias"
          color="text-red-500"
        />

        <div className="w-px h-16 bg-gray-200" />

        <Card
          icon={<Users />}
          value={totalMovimientos}
          label="Movimientos"
          color="text-green-500"
        />

      </div>

      {/* 🔥 POR AREA */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          📂 Expedientes por Área
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(dashboard.areas || {}).map(([area, total]) => (
            <div
              key={area}
              className="bg-gray-50 rounded-lg p-4 border flex justify-between items-center"
            >
              <span className="capitalize text-gray-700 font-medium">
                {area.replace("_", " ")}
              </span>

              <span className="text-xl font-bold text-blue-600">
                {total}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 🔥 FILTROS */}
      <div className="grid md:grid-cols-3 gap-4">
        <input
          type="date"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
          className="border p-2 rounded-lg"
        />

        <input
          type="text"
          placeholder="Filtrar por usuario"
          value={filtroUsuario}
          onChange={(e) => setFiltroUsuario(e.target.value)}
          className="border p-2 rounded-lg"
        />

        <input
          type="text"
          placeholder="Tipo de expediente"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="border p-2 rounded-lg"
        />
      </div>

      {/* 🔥 GRAFICOS */}
      <div className="grid md:grid-cols-2 gap-10">

        {/* TORTA */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="mb-4 font-semibold">Multas Pagadas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100}>
                {pieData.map((_, index) => (
                  <Cell key={index} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BARRAS */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="mb-4 font-semibold">Comparación</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="si" />
              <Bar dataKey="no" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* 🔥 RESUMEN */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-2">Resumen</h3>
        <p>✔️ Total Sí: {safeData.si}</p>
        <p>❌ Total No: {safeData.no}</p>
      </div>

    </div>
  );
}
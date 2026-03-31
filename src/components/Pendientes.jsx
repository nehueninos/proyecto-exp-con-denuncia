import React, { useState } from "react";
import Swal from "sweetalert2";
import { ArrowRightLeft, User, Calendar, FileText } from "lucide-react";
import apiService from "../services/api";

export default function Pendientes({ pendientes, onActionComplete }) {

  const [loadingId, setLoadingId] = useState(null);

  const handleAccept = async (id) => {

    const confirm = await Swal.fire({
      title: "¿Aceptar transferencia?",
      text: "El expediente será transferido a tu área",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, aceptar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#9ca3af"
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoadingId(id);

      await apiService.acceptTransferRequest(id);

      await Swal.fire({
        icon: "success",
        title: "Transferencia aceptada",
        text: "El expediente fue transferido correctamente.",
        confirmButtonColor: "#2563eb",
      });

      if (onActionComplete) {
        await onActionComplete();
      }

    } catch (err) {

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo aceptar la transferencia: " + err.message,
        confirmButtonColor: "#dc2626",
      });

    } finally {
      setLoadingId(null);
    }
  };

  /* ================= EMPTY STATE ================= */

  if (!pendientes || pendientes.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <div className="flex justify-center mb-4">
          <ArrowRightLeft className="w-10 h-10 opacity-40" />
        </div>
        <p className="text-lg font-medium">
          No hay transferencias pendientes
        </p>
        <p className="text-sm mt-1 text-gray-400">
          Cuando tengas solicitudes aparecerán aquí
        </p>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

      {pendientes.map((p) => (
        <div
          key={p._id}
          className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-5"
        >

          {/* HEADER */}
          <div className="flex items-center justify-between mb-4">

            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-800">
                Nº {p.expedienteId?.numero || "—"}
              </span>
            </div>

            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
              Pendiente
            </span>

          </div>

          {/* INFO */}
          <div className="space-y-2 text-sm text-gray-600">

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span><strong>De:</strong> {p.fromUserId?.name || "—"}</span>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span><strong>Para:</strong> {p.toUserId?.name || "—"}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>
                {p.createdAt
                  ? new Date(p.createdAt).toLocaleDateString()
                  : "—"}
              </span>
            </div>

          </div>

          {/* MENSAJE */}
          {p.message && (
            <div className="mt-4 bg-gray-50 border rounded-lg p-3 text-sm text-gray-700">
              {p.message}
            </div>
          )}

          {/* BOTON */}
          <div className="mt-5 flex justify-end">

            <button
              onClick={() => handleAccept(p._id)}
              disabled={loadingId === p._id}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition
                ${loadingId === p._id
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"}
              `}
            >
              {loadingId === p._id ? "Procesando..." : "Aceptar"}
            </button>

          </div>

        </div>
      ))}

    </div>
  );
}
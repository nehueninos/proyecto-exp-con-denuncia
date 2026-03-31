import React, { useState, useEffect } from 'react';
import { X, Check, Clock, User, FileText, AlertCircle } from 'lucide-react';
import Swal from "sweetalert2";
import apiService from '../services/api';

export function TransferNotifications({ onClose, onActionComplete }) {

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTransferNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar notificaciones: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ACEPTAR TRANSFERENCIA
  const handleAccept = async (notificationId) => {

    const confirm = await Swal.fire({
      title: "¿Aceptar transferencia?",
      text: "El expediente será transferido a tu área",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, aceptar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#aaa"
    });

    if (!confirm.isConfirmed) return;

    try {
      setProcessingId(notificationId);
      setError('');

      await apiService.acceptTransferRequest(notificationId);

      await Swal.fire({
        icon: "success",
        title: "Transferencia aceptada",
        text: "El expediente fue transferido correctamente.",
        confirmButtonColor: "#3085d6",
      });

      // 🔥 REFRESH LOCAL
      await loadNotifications();

      // 🔥 REFRESH GLOBAL (App.jsx)
      if (onActionComplete) {
        await onActionComplete();
      }

    } catch (err) {

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo aceptar la transferencia: " + err.message,
        confirmButtonColor: "#d33",
      });

    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Solicitudes de Transferencia
              </h2>
              <p className="text-sm text-gray-600">
                {notifications.length} pendiente{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6">

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Cargando...</p>
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-center text-gray-600">
              No hay solicitudes pendientes
            </p>
          ) : (
            <div className="space-y-4">

              {notifications.map((n) => {
                const id = n._id || n.id;

                return (
                  <div key={id} className="bg-blue-50 border rounded-xl p-5">

                    <div className="flex justify-between mb-3">
                      <div>
                        <p className="font-semibold">
                          {n.from_user?.name || "—"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {n.from_user?.area || ""}
                        </p>
                      </div>

                      <span className="text-xs text-gray-500">
                        {formatDate(n.created_at)}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded mb-3">
                      <p className="font-medium">
                        Exp: {n.expediente?.numero}
                      </p>
                      <p className="text-sm text-gray-600">
                        {n.expediente?.titulo}
                      </p>
                    </div>

                    {n.message && (
                      <p className="text-sm mb-3">
                        <b>Mensaje:</b> {n.message}
                      </p>
                    )}

                    <button
                      onClick={() => handleAccept(id)}
                      disabled={processingId === id}
                      className="w-full bg-green-600 text-white py-2 rounded-lg flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                      {processingId === id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Aceptar
                        </>
                      )}
                    </button>

                  </div>
                );
              })}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
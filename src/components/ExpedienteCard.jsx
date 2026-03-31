import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRight, Eye, FileText, AlertCircle } from 'lucide-react';
import { AREAS, AREA_COLORS } from '../utils/constants';
import apiService from '../services/api';

export function ExpedienteCard({ expediente, user, onTransfer, onViewHistory, hideTransferButton = false, isMyView = false }) {

  const [showTransferForm, setShowTransferForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [observaciones, setObservaciones] = useState('');
  const [multaPagada, setMultaPagada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [transferSent, setTransferSent] = useState(false);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [updating, setUpdating] = useState(false);

  /* ================= REGLA CLAVE ================= */
  const canTransfer =
    expediente.currentHolder === user._id && !transferSent;

  /* ================= AREAS DISPONIBLES ================= */
  const availableAreas = Object.entries(AREAS).filter(
    ([key]) =>
      key !== expediente.areaActual &&
      key !== "mesa_entrada"
  );

  useEffect(() => {
    if (showTransferForm && selectedArea) {
      loadUsersForArea(selectedArea);
    }
  }, [selectedArea, showTransferForm]);

  const loadUsersForArea = async (area) => {
    try {
      const users = await apiService.getUsersByArea(area);

      const filtered = users.filter(
        u =>
          u._id !== user._id &&
          u.area !== "mesa_entrada"
      );

      setAvailableUsers(filtered);
      setSelectedUser(filtered[0]?._id || '');

    } catch (err) {
      setError('Error al cargar usuarios: ' + err.message);
    }
  };

  const handleTransfer = async () => {
    if (!selectedUser) {
      setError('Debes seleccionar un usuario');
      return;
    }

    setLoading(true);
    setError('');

    try {
     await apiService.createTransferRequest(
  expediente._id,
  selectedUser,
  observaciones,
  multaPagada,
  selectedArea // 🔥 ESTO ES LO IMPORTANTE
);

      setShowTransferForm(false);
      setObservaciones('');
      setSelectedArea('');
      setSelectedUser('');
      setMultaPagada(null);

      setTransferSent(true);

      setSuccessMessage('Transferencia enviada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);

      if (onTransfer) onTransfer();

    } catch (error) {
      setError('Error al enviar solicitud: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEstado = async () => {
    if (!nuevoEstado.trim()) {
      setError("Debes ingresar un estado");
      return;
    }

    setUpdating(true);
    setError('');

    try {
      await apiService.updateExpedienteEstado(
        expediente._id,
        nuevoEstado
      );

      setShowUpdateModal(false);
      setNuevoEstado('');

      setSuccessMessage('Estado actualizado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);

      if (onTransfer) onTransfer();

    } catch (err) {
      setError("Error al actualizar: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  /* ================= COLORES ================= */

  const getPriorityColor = (prioridad) => {
    if (!prioridad) return 'bg-gray-100 text-gray-800';

    switch (prioridad.toLowerCase()) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-orange-100 text-orange-800';
      case 'baja': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /* ================= UI ================= */

  return (
    <>
      {successMessage && (
        <div className="fixed top-5 right-5 z-50 animate-slideIn">
          <div className="bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <div className="bg-white/20 p-1 rounded-full">✓</div>
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">

        <div className="p-6">

          {/* HEADER */}
          <div className="flex items-start justify-between mb-4">

            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {expediente.nombre}
                </h3>

                <p className="text-sm text-gray-600">
                  Nº {expediente.numero}
                </p>

                {expediente.articulo && (
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    Art. {expediente.articulo} Ley 24.240
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end space-y-2">

              <span className={`px-2 py-1 text-xs font-medium rounded-full ${AREA_COLORS[expediente.areaActual]}`}>
                Área: {AREAS[expediente.areaActual]}
              </span>

              {expediente.prioridad && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(expediente.prioridad)}`}>
                  Prioridad: {expediente.prioridad}
                </span>
              )}

            </div>
          </div>

          {/* PREVIEW */}
          {expediente.caratula && (
            <div className="mb-4">
              {expediente.caratulaType === "application/pdf" ? (
                <embed
                  src={expediente.caratula}
                  type="application/pdf"
                  className="w-full h-32 rounded-lg border"
                />
              ) : (
                <img
                  src={expediente.caratula}
                  alt="Carátula"
                  className="w-full h-32 object-cover rounded-lg border"
                />
              )}
            </div>
          )}

          {/* INFO */}
          <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">

            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{expediente.fechaCreacion}</span>
            </div>

            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{expediente.horaCreacion}</span>
            </div>

          </div>

          <div className="text-xs text-gray-500 mb-4">
            Por: {expediente.createdBy?.name || 'Desconocido'}
          </div>

          {/* ACCIONES */}
          <div className="flex items-center justify-between">

            {isMyView ? (
              <button
                onClick={() => setShowUpdateModal(true)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <span>Actualizar estado</span>
              </button>
            ) : (
              <button
                onClick={() => onViewHistory(expediente)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Eye className="w-4 h-4" />
                <span>Ver Información</span>
              </button>
            )}

            {canTransfer && !hideTransferButton && (
              <button
                onClick={() => {
                  setShowTransferForm(true);
                  if (availableAreas.length > 0) {
                    setSelectedArea(availableAreas[0][0]);
                  }
                }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Transferir</span>
              </button>
            )}

          </div>

        </div>

        {/* MODAL ACTUALIZAR */}
        {showUpdateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-gray-100">

              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Actualizar Estado
              </h3>

              {error && (
                <div className="mb-4 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <input
                type="text"
                placeholder="Nuevo estado"
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value)}
                className="w-full mb-5 px-3 py-2 border border-gray-300 rounded-lg"
              />

              <div className="flex justify-end gap-3">

                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleUpdateEstado}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? 'Guardando...' : 'Guardar'}
                </button>

              </div>

            </div>
          </div>
        )}

        {/* MODAL TRANSFERENCIA */}
        {showTransferForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-gray-100">

              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Solicitar Transferencia
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 flex gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  {error}
                </div>
              )}

              <label className="block text-sm font-medium text-gray-600 mb-1">
                Área destino
              </label>
              <select
                className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-lg"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
              >
                {availableAreas.map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>

              {/* 🔥 AGREGADO SIN TOCAR NADA */}
              {(selectedArea === "archivo" || selectedArea === "instructor") && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    ¿Se pagó alguna multa?
                  </p>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      SI<input
  type="checkbox"
  checked={multaPagada === "si"}
  onChange={() => setMultaPagada("si")}
/>


                    </label>

                    <label className="flex items-center gap-2">
                     NO<input
  type="checkbox"
  checked={multaPagada === "no"}
  onChange={() => setMultaPagada("no")}
  
/>
                    </label>
                  </div>
                </div>
              )}

              <label className="block text-sm font-medium text-gray-600 mb-1">
                Usuario
              </label>
              <select
                className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-lg"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Seleccionar usuario</option>
                {availableUsers.map(u => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>

              <textarea
                className="w-full mb-5 px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Mensaje"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />

              <div className="flex justify-end gap-3">

                <button
                  onClick={() => setShowTransferForm(false)}
                  className="px-4 py-2 bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleTransfer}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  {loading ? 'Enviando...' : 'Enviar'}
                </button>

              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
}
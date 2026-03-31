import React, { useState, useEffect } from 'react';
import { Plus, Upload, X } from 'lucide-react';

export function NewExpedienteForm({ user, onSubmit, onClose }) {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [conciliacionUsers, setConciliacionUsers] = useState([]);

  const [formData, setFormData] = useState({
    numero: '',
    nombre: '',
    denunciante: '',
    denunciado: '',
    escritos: '',
    descripcion: '',
    articulo: '1',
    estado: 'activo',
    prioridad: 'media',
    localidad: 'Formosa_Capital',
    usuarioAsignado: '',
    caratula: '',
    caratulaType: '',
  });

  /* ================= FETCH CONCILIADORES ================= */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await fetch('http://localhost:5000/api/by-area/conciliacion', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setConciliacionUsers(data);
      } catch (err) {
        console.error('Error cargando conciliadores:', err);
      }
    };

    fetchUsers();
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (typeof onSubmit !== 'function') {
      console.error('❌ onSubmit no es una función');
      return;
    }

    setLoading(true);

    try {
      await onSubmit(formData);
      onClose && onClose();
    } catch (error) {
      console.error('Error al crear expediente:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILE HANDLERS ================= */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({
        ...prev,
        caratula: e.target.result,
        caratulaType: file.type,
      }));
    };
    reader.readAsDataURL(file);
  };

  /* ================= RENDER ================= */
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Nuevo Expediente</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <input
              placeholder="Número de expediente"
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              className="border p-3 rounded"
              required
            />

            <input
              placeholder="Nombre del expediente"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="border p-3 rounded"
              required
            />

            <input
              placeholder="Denunciante"
              value={formData.denunciante}
              onChange={(e) => setFormData({ ...formData, denunciante: e.target.value })}
              className="border p-3 rounded"
            />

            <input
              placeholder="Denunciado"
              value={formData.denunciado}
              onChange={(e) => setFormData({ ...formData, denunciado: e.target.value })}
              className="border p-3 rounded"
            />

            <input
              placeholder="Escritos"
              value={formData.escritos}
              onChange={(e) => setFormData({ ...formData, escritos: e.target.value })}
              className="border p-3 rounded"
            />

            <select
              value={formData.prioridad}
              onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
              className="border p-3 rounded"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>

            <select
              value={formData.articulo}
              onChange={(e) => setFormData({ ...formData, articulo: e.target.value })}
              className="border p-3 rounded md:col-span-2"
            >
              <option value="1">Artículo 1</option>
              <option value="2">Artículo 2</option>
              <option value="3">Artículo 3</option>
              <option value="4">Artículo 4</option>
              <option value="5">Artículo 5</option>
              <option value="6">Artículo 6</option>
            </select>

            {/* CONCILIADOR */}
            <select
              value={formData.usuarioAsignado}
              onChange={(e) =>
                setFormData({ ...formData, usuarioAsignado: e.target.value })
              }
              className="border p-3 rounded md:col-span-2"
            >
              <option value="">Seleccionar conciliador</option>
              {conciliacionUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.username})
                </option>
              ))}
            </select>

            {/* LOCALIDAD */}
            <select
              value={formData.localidad}
              onChange={(e) =>
                setFormData({ ...formData, localidad: e.target.value })
              }
              className="border p-3 rounded md:col-span-2"
            >
              <option value="Formosa_Capital">Formosa Capital</option>
              <option value="Clorinda">Clorinda</option>
              <option value="El_Colorado">El Colorado</option>
              <option value="Ingeniero_Juarez">Ingeniero Juárez</option>
              <option value="Las_Lomitas">Las Lomitas</option>
              <option value="Ibarreta">Ibarreta</option>
              <option value="Laguna_Blanca">Laguna Blanca</option>
              <option value="Comandante_Fontana">Comandante Fontana</option>
              <option value="Palo_Santo">Palo Santo</option>
              <option value="Espinillo">Espinillo</option>
              <option value="Pirane">Pirané</option>
            </select>
          </div>

          {/* CARÁTULA */}
          {formData.caratula ? (
            <div className="relative">
              {formData.caratulaType === 'application/pdf' ? (
                <embed src={formData.caratula} className="w-full h-64" />
              ) : (
                <img src={formData.caratula} className="w-full h-64 object-cover" />
              )}
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, caratula: '', caratulaType: '' })
                }
                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed p-6 text-center rounded ${
                dragActive ? 'border-blue-500' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto mb-2" />
              <input
                type="file"
                accept="image/*,application/pdf"
                hidden
                id="file"
                onChange={(e) =>
                  e.target.files?.[0] && handleFile(e.target.files[0])
                }
              />
              <label htmlFor="file" className="cursor-pointer text-blue-600">
                Seleccionar archivo
              </label>
            </div>
          )}

          <textarea
            placeholder="Descripción"
            value={formData.descripcion}
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
            className="border p-3 rounded w-full"
            rows={4}
          />

          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
            >
              <Plus size={16} /> Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
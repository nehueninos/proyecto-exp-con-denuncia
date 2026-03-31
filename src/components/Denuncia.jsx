import React, { useState } from "react";
import apiService from "../services/api";
import { X, FileText } from "lucide-react";
import { showSuccess, showError, showWarning } from "../utils/alerts";

export default function Denuncia({ onClose }) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombreCompleto: "",
    dni: "",
    telefono: "",
    email: "",
    domicilio: "",
    ciudad: "Formosa",

    hora: "",
    dia: "",
    mes: "",
    anio: "2026",

    motivoDenuncia: "",
    domicilioComercial: "",
    relacionConsumo: "",
    documentalesAdjuntas: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCrearDenuncia = async () => {
    try {
      setLoading(true);

      if (!formData.nombreCompleto || !formData.dni) {
        showWarning("Nombre y DNI son obligatorios");
        return;
      }

      const nuevaDenuncia = await apiService.request("/denuncias", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!nuevaDenuncia?._id) {
        throw new Error("Error al crear denuncia");
      }

      const blob = await apiService.descargarPDFDenuncia(nuevaDenuncia._id);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `denuncia_${nuevaDenuncia.numero || nuevaDenuncia._id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      showSuccess("Denuncia creada correctamente");

      onClose();

    } catch (err) {
      console.error(err);
      showError(err.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border">

        {/* HEADER */}
        <div className="flex justify-between items-center p-5 border-b">
          <div className="flex items-center gap-2">
            <FileText className="text-red-600" />
            <h2 className="text-lg font-semibold">Nueva Denuncia</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">

          {[
            { name: "nombreCompleto", placeholder: "Nombre completo *" },
            { name: "dni", placeholder: "DNI *" },
            { name: "telefono", placeholder: "Teléfono" },
            { name: "email", placeholder: "Email" },
            { name: "domicilio", placeholder: "Domicilio" },
            { name: "ciudad", placeholder: "Ciudad", defaultValue: "Formosa" },
          ].map((field) => (
            <input
              key={field.name}
              name={field.name}
              placeholder={field.placeholder}
              defaultValue={field.defaultValue}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          ))}

          {/* FECHA */}
          <div className="md:col-span-2 grid grid-cols-4 gap-2">
            {["hora", "dia", "mes", "anio"].map((f) => (
              <input
                key={f}
                name={f}
                placeholder={f.toUpperCase()}
                defaultValue={f === "anio" ? "2026" : ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            ))}
          </div>

          <input
            name="motivoDenuncia"
            placeholder="Empresa denunciada"
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg md:col-span-2 focus:ring-2 focus:ring-red-500"
          />

          <input
            name="domicilioComercial"
            placeholder="Domicilio comercial"
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg md:col-span-2 focus:ring-2 focus:ring-red-500"
          />

          <textarea
            name="relacionConsumo"
            placeholder="Relación de consumo / Descripción"
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg md:col-span-2 h-28 focus:ring-2 focus:ring-red-500"
          />

          <textarea
            name="documentalesAdjuntas"
            placeholder="Documentales adjuntas"
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg md:col-span-2 h-20 focus:ring-2 focus:ring-red-500"
          />

        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 p-5 border-t">

          {/* CANCELAR */}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>

          {/* GENERAR PDF */}
          <button
            onClick={handleCrearDenuncia}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Guardar y Generar PDF"}
          </button>

        </div>

      </div>
    </div>
  );
}
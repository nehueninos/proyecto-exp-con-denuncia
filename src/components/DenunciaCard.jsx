import React, { useState, useEffect } from "react";
import apiService from "../services/api";
import { Download, Eye, X } from "lucide-react";

export default function DenunciaCard({ denuncia, enablePreview = false }) {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showModal, setShowModal] = useState(false);

  /* ================= PREVIEW SOLO SI BUSCA ================= */
  useEffect(() => {
    if (!enablePreview) return;

    const generarPreview = async () => {
      try {
        setLoadingPreview(true);

        const blob = await apiService.descargarPDFDenuncia(denuncia._id);
        const url = window.URL.createObjectURL(blob);

        setPdfUrl(url);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPreview(false);
      }
    };

    generarPreview();

    return () => {
      if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
    };
  }, [denuncia._id, enablePreview]);

  /* ================= DESCARGAR ================= */
  const descargarPDF = async () => {
    try {
      setLoading(true);

      const blob = await apiService.descargarPDFDenuncia(denuncia._id);
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `denuncia_${denuncia.numero || denuncia._id}.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
      alert("Error descargando PDF");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ABRIR MODAL ================= */
  const openModal = async () => {
    if (!pdfUrl) {
      try {
        setLoadingPreview(true);
        const blob = await apiService.descargarPDFDenuncia(denuncia._id);
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        setShowModal(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPreview(false);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-5 flex flex-col gap-3">

        {/* HEADER */}
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">
            {denuncia.nombreCompleto || "Sin nombre"}
          </h3>

          <span className="text-sm text-gray-500">
            #{denuncia.numero || "—"}
          </span>
        </div>

        {/* PREVIEW CHICO */}
        <div
          onClick={openModal}
          className="w-full h-32 border rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition"
        >
          {loadingPreview ? (
            <span className="text-sm text-gray-500">Cargando...</span>
          ) : pdfUrl ? (
            <embed src={pdfUrl} type="application/pdf" className="w-full h-full" />
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <Eye size={20} />
              <span className="text-xs">Ver PDF</span>
            </div>
          )}
        </div>

        {/* DATOS */}
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>DNI:</strong> {denuncia.dni || "-"}</p>
          <p><strong>Tel:</strong> {denuncia.telefono || "-"}</p>
          <p><strong>Email:</strong> {denuncia.email || "-"}</p>
        </div>

        {/* MOTIVO */}
        <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 line-clamp-3">
          {denuncia.motivoDenuncia || "Sin descripción"}
        </div>

        {/* BOTONES */}
        <div className="flex justify-between mt-2">

          <button
            onClick={openModal}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Eye size={16} /> Ver
          </button>

          <button
            onClick={descargarPDF}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
          >
            <Download size={16} />
            {loading ? "..." : "PDF"}
          </button>

        </div>

      </div>

      {/* 🔥 MODAL PDF GRANDE */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">

          <div className="bg-white w-[90%] h-[90%] rounded-xl overflow-hidden relative">

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 bg-black/70 text-white p-2 rounded-full"
            >
              <X size={18} />
            </button>

            {pdfUrl ? (
              <embed
                src={pdfUrl}
                type="application/pdf"
                className="w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                Cargando PDF...
              </div>
            )}

          </div>

        </div>
      )}
    </>
  );
}
import React from "react";
import Swal from "sweetalert2";
import apiService from "../services/api";

export default function Pendientes({ pendientes, onAccepted }) {

  


  // ✅ FUNCIÓN PARA ACEPTAR TRANSFERENCIA
 const handleAccept = async (id) => {
  try {
    await apiService.acceptTransferRequest(id);
    Swal.fire({
      icon: "success",
      title: "Transferencia aceptada",
      text: "El expediente fue transferido correctamente.",
      confirmButtonColor: "#3085d6",
    });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo aceptar la transferencia: " + err.message,
      confirmButtonColor: "#d33",
    });
  }
};
  
  return (
    <div style={{ padding: "20px" }}>
      <h2>Transferencias Pendientes</h2>

      {pendientes.length === 0 ? (
        <p>No hay transferencias pendientes.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "15px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={thStyle}>N° Expediente</th>
              <th style={thStyle}>Origen</th>
              <th style={thStyle}>Destino</th>
              <th style={thStyle}>Fecha</th>
              <th style={thStyle}>Mensaje</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pendientes.map((p) => (
              <tr key={p._id} style={{ borderBottom: "1px solid #ddd" }}>
                {/* ✅ número de expediente */}
                <td style={tdStyle}>
                  {p.expedienteId?.numero || "—"}
                </td>

                {/* ✅ origen */}
                <td style={tdStyle}>
                  {p.fromUserId?.name || "—"}
                </td>

                {/* ✅ destino */}
                <td style={tdStyle}>
                  {p.toUserId?.name || "—"}
                </td>

                {/* ✅ fecha */}
                <td style={tdStyle}>
                  {p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString()
                    : "—"}
                </td>
                  {/* ✅ mensaje */}
      <td style={tdStyle}>
        {p.message || "—"}
      </td>

                {/* ✅ acciones */}
                <td style={tdStyle}>
                  <button
                     style={btnAceptar}
                    onClick={() => handleAccept(p._id)}

                  >
                    Aceptar
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = {
  padding: "10px",
  borderBottom: "2px solid #ccc",
  textAlign: "left",
};

const tdStyle = {
  padding: "10px",
};

const btnAceptar = {
  backgroundColor: "#4caf50",
  color: "white",
  border: "none",
  padding: "6px 12px",
  marginRight: "5px",
  cursor: "pointer",
  borderRadius: "4px",
};

const btnRechazar = {
  backgroundColor: "#e53935",
  color: "white",
  border: "none",
  padding: "6px 12px",
  cursor: "pointer",
  borderRadius: "4px",
};

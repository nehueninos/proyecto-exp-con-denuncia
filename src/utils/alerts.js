import Swal from "sweetalert2";

export const showSuccess = (text) => {
  return Swal.fire({
    icon: "success",
    title: "Listo",
    text,
    confirmButtonColor: "#16a34a",
    timer: 2000,
    showConfirmButton: false,
  });
};

export const showError = (text) => {
  return Swal.fire({
    icon: "error",
    title: "Error",
    text,
    confirmButtonColor: "#dc2626",
  });
};

export const showWarning = (text) => {
  return Swal.fire({
    icon: "warning",
    title: "Atención",
    text,
    confirmButtonColor: "#f59e0b",
  });
};

export const showConfirm = (text) => {
  return Swal.fire({
    title: "¿Estás seguro?",
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#9ca3af",
  });
};
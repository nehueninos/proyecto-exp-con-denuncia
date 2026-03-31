import React, { useEffect, useState } from "react";

const LOGO =
  "https://res.cloudinary.com/dabtnpikz/image/upload/v1770386106/subselogo_zzebp7.png";

export default function LoadingPage({ onFinish }) {
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        const next = prev + Math.random() * 14;
        return Math.min(next, 92);
      });
    }, 120);

    const finish = setTimeout(() => {
      setProgress(100);

      setTimeout(() => {
        onFinish();
      }, 300);
    }, 1700);

    return () => {
      clearInterval(interval);
      clearTimeout(finish);
    };
  }, [onFinish]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#312e81]">
      
      {/* glow */}
      <div className="absolute w-[400px] h-[400px] bg-blue-500 opacity-20 blur-3xl rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-500 opacity-20 blur-3xl rounded-full bottom-[-100px] right-[-100px]" />

      <div className="z-10 text-center text-white max-w-md w-full px-6">
        
        <img src={LOGO} alt="Logo" className="w-25 mx-auto mb-4" />

        <h1 className="text-xl font-semibold mb-2">
          Sistema de expedientes
        </h1>

        <p className="text-gray-400 text-sm mb-6">
          Inicializando módulos
        </p>

        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-gray-400">
          {Math.round(progress)}%
        </p>

        <p className="text-xs text-gray-500 mt-4">
          Preparando expedientes, denuncias, usuarios, areas y estadisticas...
        </p>
      </div>
    </div>
  );
}
import React from 'react';
import { LogOut, User as UserIcon, FileText, Bell } from 'lucide-react';
import { AREAS } from '../utils/constants';

export function Header({ 
  user, 
  onLogout, 
  notificationCount, 
  onNotificationClick, 
  onViewChange,
  currentView
}) {

  const getButtonClass = (view) => {
    return `
      px-3 py-2 rounded-lg text-sm font-medium transition
      ${currentView === view
        ? "bg-blue-600 text-white shadow-md"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
    `;
  };

  return (
    <header className="bg-white shadow-sm border-b bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#312e81]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between items-center h-16">

          {/* LOGO */}
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Sistema de Expedientes
              </h1>
              <p className="text-sm text-white">
                {AREAS[user.area]}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">

            {/* BOTONES DE VISTA */}
            <div className="flex items-center space-x-3">

              {/* SIEMPRE */}
              <button
                onClick={() => onViewChange("all")}
                className={getButtonClass("all")}
              >
                Todos
              </button>

              {/* SOLO SI NO ES MESA DE ENTRADA */}
              {user?.area !== "mesa_entrada" && (
                <>
                  <button
                    onClick={() => onViewChange("my")}
                    className={getButtonClass("my")}
                  >
                    Mis expedientes
                  </button>

                  <button
                    onClick={() => onViewChange("pending")}
                    className={getButtonClass("pending")}
                  >
                    Pendientes
                  </button>
                  <button
                onClick={() => onViewChange("stats")}
                className={getButtonClass("stats")}
              >
              Estadisticas
              </button>
                  
                </>
              )}

            </div>

            {/* NOTIFICACIONES (NO PARA MESA DE ENTRADA) */}
            {user?.area !== "mesa_entrada" && (
              <button
                onClick={onNotificationClick}
                className="relative flex items-center space-x-2 px-3 py-2 text-white hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />

                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            )}

            {/* USUARIO */}
            <div className="flex items-center space-x-2 text-white">
              <UserIcon className="w-5 h-5" />
              <span className="font-medium">{user.name}</span>

              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {user.role === 'admin' ? 'Admin' : 'Usuario'}
              </span>
            </div>

            {/* LOGOUT */}
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-3 py-2 text-white hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>

          </div>

        </div>

      </div>
    </header>
  );
}
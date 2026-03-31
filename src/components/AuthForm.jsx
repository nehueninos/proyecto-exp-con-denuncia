import React, { useState } from 'react';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { AREAS } from '../utils/constants';
import apiService from '../services/api';
import WorldCanvas from './WorldCanvas';

export function AuthForm({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    area: 'mesa_entrada',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let response;
      if (isLogin) {
        response = await apiService.login({
          username: formData.username,
          password: formData.password,
        });
      } else {
        response = await apiService.register({
          username: formData.username,
          password: formData.password,
          name: formData.name,
          area: formData.area,
        });
      }

      onLogin(response.user);
    } catch (error) {
      setError(error.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#312e81]">
       <WorldCanvas />
      <div className="w-full max-w-md bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <LogIn className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
            Sistema de Expedientes
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            {isLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Usuario */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Usuario</label>
            <input
              type="text"
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          {/* Registro extra */}
          {!isLogin && (
            <>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Nombre completo</label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Área</label>
                <select
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                >
                  {Object.entries(AREAS).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Password */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Contraseña</label>
            <input
              type="password"
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </>
            )}
          </button>
        </form>

        {/* Switch */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>

        {/* Nota */}
        {isLogin && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700 text-center">
            Crea una cuenta o usa credenciales existentes
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import Denuncia from "./components/Denuncia";
import { AuthForm } from './components/AuthForm';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ExpedienteCard } from './components/ExpedienteCard';
import { NewExpedienteForm } from './components/NewExpedienteForm';
import { ExpedienteHistory } from './components/ExpedienteHistory';
import { TransferNotifications } from './components/TransferNotifications';
import { PendingTransfersModal } from './components/PendingTransfersModal';
import Pendientes from './components/Pendientes';

import apiService from './services/api';

function App() {
  const [user, setUser] = useLocalStorage('user', null);

  const [expedientes, setExpedientes] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
const [showDenuncia, setShowDenuncia] = useState(false);
  const [currentView, setCurrentView] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedExpediente, setSelectedExpediente] = useState(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [hasCheckedNotifications, setHasCheckedNotifications] = useState(false);

  /* ================= EFFECT ================= */
  useEffect(() => {
    if (!user) return;

    if (currentView === 'all') loadExpedientes();
    if (currentView === 'pending') loadPendientes();

    checkInitialNotifications();

    const interval = setInterval(loadNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [user, currentView, searchTerm, selectedArea, selectedStatus]);

  /* ================= API ================= */
  const loadExpedientes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getExpedientes({
        search: searchTerm,
        area: selectedArea,
        estado: selectedStatus,
      });
      setExpedientes(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const loadPendientes = async () => {
    try {
      const data = await apiService.getPendingTransfers();
      setPendientes(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadNotificationCount = async () => {
    const data = await apiService.getTransferNotifications();
    setNotificationCount(data.length);
  };

  const checkInitialNotifications = async () => {
    if (hasCheckedNotifications) return;

    const data = await apiService.getTransferNotifications();
    setNotificationCount(data.length);
    if (data.length > 0) setShowPendingModal(true);
    setHasCheckedNotifications(true);
  };

  /* ================= AUTH ================= */
  const handleLogin = (u) => {
    setUser(u);
    setHasCheckedNotifications(false);
    setCurrentView('all'); 
  };

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
  };

  if (!user) return <AuthForm onLogin={handleLogin} />;

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={user}
        onLogout={handleLogout}
        notificationCount={notificationCount}
        onNotificationClick={() => setShowNotifications(true)}
        onViewChange={setCurrentView}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedArea={selectedArea}
          onAreaChange={setSelectedArea}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
{/* ===== BOTÓN NUEVO EXPEDIENTE ===== */}
{currentView === 'all' && (
  <div className="flex justify-end mb-6">
    <button
      onClick={() => setShowNewForm(true)}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow transition"
    >
      <Plus className="w-5 h-5" />
      Nuevo Expediente
    </button>
  </div>
)}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded mb-4 flex items-center gap-2">
            <AlertCircle />
            {error}
          </div>
        )}
   {/* ===== BOTÓN NUEVA DENUNCIA ===== */}     
<button

  onClick={() => setShowDenuncia(true)}
  style={{ marginLeft: 10 }}
  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow transition"
    
    
>
  Nueva Denuncia
</button>
        {/* ===== ALL ===== */}
        {currentView === 'all' && (
          loading ? (
            <p>Cargando...</p>
          ) : expedientes.length === 0 ? (
            <p>No hay expedientes</p>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {expedientes.map(e => (
                <ExpedienteCard
                  key={e._id}
                  expediente={e}
                  user={user}
                  onViewHistory={setSelectedExpediente}
                />
              ))}
            </div>
          )
        )}

        {/* ===== PENDING ===== */}
        {currentView === 'pending' && (
          pendientes.length === 0
            ? <p>No hay transferencias pendientes</p>
            : <Pendientes pendientes={pendientes} />
        )}
      </main>

      {showNewForm && (
        <NewExpedienteForm
          user={user}
          onClose={() => setShowNewForm(false)}
        />
      )}
{showDenuncia && (
  <Denuncia onClose={() => setShowDenuncia(false)} />
)}
      {selectedExpediente && (
        <ExpedienteHistory
          expediente={selectedExpediente}
          onClose={() => setSelectedExpediente(null)}
        />
      )}

      {showNotifications && (
        <TransferNotifications
          onClose={() => setShowNotifications(false)}
        />
      )}

      {showPendingModal && (
        <PendingTransfersModal
          count={notificationCount}
          onClose={() => setShowPendingModal(false)}
          onViewNotifications={() => setShowNotifications(true)}
        />
      )}
    </div>
  );
}

export default App;

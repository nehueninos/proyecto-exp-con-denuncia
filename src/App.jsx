import React, { useState, useEffect, useCallback } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';

import DenunciaCard from './components/DenunciaCard';
import Denuncia from "./components/Denuncia";
import { AuthForm } from './components/AuthForm';
import LoadingPage from './components/LoadingPage'; // 🔥 AGREGADO
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ExpedienteCard } from './components/ExpedienteCard';
import { NewExpedienteForm } from './components/NewExpedienteForm';
import { ExpedienteHistory } from './components/ExpedienteHistory';
import { TransferNotifications } from './components/TransferNotifications';
import { PendingTransfersModal } from './components/PendingTransfersModal';
import Pendientes from './components/Pendientes';
import Estadisticas from './components/Estadisticas';

import apiService from './services/api';

function App() {

  const [user, setUser] = useLocalStorage('user', null);

  // 🔥 NUEVO ESTADO
  const [showLoadingPage, setShowLoadingPage] = useState(false);

  const [activeTab, setActiveTab] = useState("expedientes");

  const [expedientes, setExpedientes] = useState([]);
  const [denuncias, setDenuncias] = useState([]);
  const [pendientes, setPendientes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showDenuncia, setShowDenuncia] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedExpediente, setSelectedExpediente] = useState(null);

  const [currentView, setCurrentView] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [hasCheckedNotifications, setHasCheckedNotifications] = useState(false);

  const isSearching = searchTerm || selectedArea !== 'all' || selectedStatus !== 'all';

  const getTabClass = (tab) => {
    return `
      px-4 py-2 rounded-lg text-sm font-medium transition
      ${activeTab === tab
        ? tab === "expedientes"
          ? "bg-blue-600 text-white shadow"
          : "bg-red-600 text-white shadow"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
    `;
  };

  const refreshAllData = useCallback(async () => {
    await Promise.all([
      loadNotificationCount(),
      loadPendientes(),
      loadExpedientes(),
      loadDenuncias()
    ]);
  }, [searchTerm, selectedArea, selectedStatus]);

  useEffect(() => {
    if (!user) return;

    loadDenuncias();
    checkInitialNotifications();

    const interval = setInterval(() => {
      loadNotificationCount();
    }, 30000);

    return () => clearInterval(interval);

  }, [user]);

  useEffect(() => {
    if (!user) return;

    if (currentView === 'all') loadExpedientes();
    if (currentView === 'my') loadMyExpedientes();
    if (currentView === 'pending') loadPendientes();

  }, [user, currentView, searchTerm, selectedArea, selectedStatus]);

  const loadExpedientes = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await apiService.getExpedientes({
        search: searchTerm,
        area: selectedArea,
        estado: selectedStatus,
        limit: isSearching ? 0 : 10
      });

      setExpedientes(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    }

    setLoading(false);
  };

  const loadMyExpedientes = async () => {
    setLoading(true);
    try {
      const data = await apiService.getMyExpedientes();
      setExpedientes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const loadDenuncias = async () => {
    try {
      const data = await apiService.getDenuncias();
      setDenuncias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setDenuncias([]);
    }
  };

  const loadPendientes = async () => {
    try {
      const data = await apiService.getPendingTransfers();
      setPendientes(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadNotificationCount = async () => {
    try {
      const data = await apiService.getTransferNotifications();
      setNotificationCount(data.length);
    } catch (e) {
      console.error(e);
    }
  };

  const checkInitialNotifications = async () => {
    if (hasCheckedNotifications) return;

    try {
      const data = await apiService.getTransferNotifications();
      setNotificationCount(data.length);

      if (data.length > 0) setShowPendingModal(true);

      setHasCheckedNotifications(true);
    } catch (e) {
      console.error(e);
    }
  };

  // 🔥 MODIFICADO
  const handleLogin = (u) => {
    setUser(u);
    setHasCheckedNotifications(false);
    setShowLoadingPage(true); // 👉 dispara loading
  };

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
  };

  // 🔥 FLUJO LOGIN → LOADING → APP
  if (!user) return <AuthForm onLogin={handleLogin} />;

  if (showLoadingPage) {
    return <LoadingPage onFinish={() => setShowLoadingPage(false)} />;
  }

  const denunciasFiltradas = denuncias.filter((d) => {
    const search = searchTerm.toLowerCase();

    return (
      (d.nombreCompleto || "").toLowerCase().includes(search) ||
      (d.motivoDenuncia || "").toLowerCase().includes(search) ||
      String(d.dni || "").includes(search)
    );
  });

  const Loader = () => (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="bg-white p-6 rounded-xl border h-40 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );

  const EmptyState = ({ message }) => (
    <div className="text-center py-16 text-gray-500">
      <p className="text-lg font-medium">{message}</p>
    </div>
  );

  return (
    <div className=" bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#312e81]">

      <Header
        user={user}
        onLogout={handleLogout}
        notificationCount={notificationCount}
        onNotificationClick={() => setShowNotifications(true)}
        onViewChange={setCurrentView}
        currentView={currentView}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">

        {currentView === "stats" && <Estadisticas />}

        {currentView !== "stats" && (
          <>
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedArea={selectedArea}
              onAreaChange={setSelectedArea}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
            />

            <div className="flex gap-2 mb-6">
              <button onClick={() => setActiveTab("expedientes")} className={getTabClass("expedientes")}>
                Expedientes
              </button>

              <button onClick={() => setActiveTab("denuncias")} className={getTabClass("denuncias")}>
                Denuncias
              </button>
            </div>

            {(currentView === 'all' || currentView === 'my') && (
              <>
                <div className="flex justify-end mb-6 gap-2">

                  {activeTab === "expedientes" && user?.area === "despacho" && (
                    <button
                      onClick={() => setShowNewForm(true)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                      <Plus /> Nuevo Expediente
                    </button>
                  )}

                  {activeTab === "denuncias" && user?.area === "mesa_entrada" && (
                    <button
                      onClick={() => setShowDenuncia(true)}
                      className="flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-lg hover:bg-red-700 transition"
                    >
                      <Plus /> Nueva Denuncia
                    </button>
                  )}

                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-700 rounded mb-4 flex gap-2">
                    <AlertCircle />
                    {error}
                  </div>
                )}

                {activeTab === "expedientes" && (
                  loading ? <Loader /> :
                  expedientes.length === 0 ? (
                    <EmptyState message={
                      isSearching
                        ? "No se encontró ningún expediente con ese criterio"
                        : "No hay expedientes disponibles"
                    } />
                  ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {expedientes.map(e => (
                        <ExpedienteCard
                          key={e._id}
                          expediente={e}
                          user={user}
                          onViewHistory={setSelectedExpediente}
                          hideTransferButton={currentView === 'all'}
                          isMyView={currentView === 'my'}
                        />
                      ))}
                    </div>
                  )
                )}

                {activeTab === "denuncias" && (
                  (() => {
                    const lista = searchTerm
                      ? denunciasFiltradas
                      : denuncias.slice(0, 6);

                    return lista.length === 0 ? (
                      <EmptyState message={
                        searchTerm
                          ? "No se encontró ninguna denuncia con ese criterio"
                          : "No hay denuncias registradas"
                      } />
                    ) : (
                      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {lista.map(d => (
                          <DenunciaCard
                            key={d._id}
                            denuncia={d}
                            enablePreview={!!searchTerm}
                          />
                        ))}
                      </div>
                    );
                  })()
                )}
              </>
            )}

            {currentView === 'pending' && (
              pendientes.length === 0 ? (
                <EmptyState message="No hay transferencias pendientes" />
              ) : (
                <Pendientes
                  pendientes={pendientes}
                  onActionComplete={refreshAllData}
                />
              )
            )}
          </>
        )}

      </main>

      {showNewForm && (
        <NewExpedienteForm
          user={user}
          onSubmit={async (data) => {
            await apiService.createExpediente(data);
            await refreshAllData();
            setShowNewForm(false);
          }}
          onClose={() => setShowNewForm(false)}
        />
      )}

      {showDenuncia && (
        <Denuncia
          onClose={() => {
            setShowDenuncia(false);
            loadDenuncias();
          }}
        />
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
          onUpdate={refreshAllData}
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
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, AlertCircle, Clock, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import ModalConsulta from '../Modals/ModalConsulta';
import API_BASE_URL from "../../config";

const ProcessListTable = () => {
  const [processes, setProcesses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProcessId, setSelectedProcessId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userId = sessionStorage.getItem("cedula");
        const userRole = sessionStorage.getItem("rol");

        let processesResponse;
        if (userRole === "7") {
          processesResponse = await axios.get(`http://${API_BASE_URL}/api/procesos/usuario/${userId}/`);
        } else {
          processesResponse = await axios.get(`http://${API_BASE_URL}/api/procesos/`);
        }

        if (Array.isArray(processesResponse.data)) {
          setProcesses(
            processesResponse.data.map(proc => ({
              id: proc.proceso_id,
              name: proc.seriado_proceso,
              status: proc.estado
            }))
          );
        } else {
          setProcesses([]);
        }
      } catch (err) {
        console.error("Error al obtener los datos:", err);
        setProcesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Configuración del WebSocket
    const setupWebSocket = () => {
      const userId = sessionStorage.getItem("cedula");

      if (socketRef.current) {
        socketRef.current.close();
      }
   
      socketRef.current = new WebSocket(`ws://${API_BASE_URL}/ws/notifications/${userId}/`);

      socketRef.current.onopen = () => {
        console.log("✅ Conectado al WebSocket de notificaciones");
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const newNotification = {
            id: data.id_notificacion || Date.now(),
            type: data.mensaje && data.mensaje.toLowerCase().includes("error") ? "alert" : "notification",
            message: data.mensaje || "Nueva notificación recibida",
            timestamp: new Date().toISOString()
          };
          // Agrega al principio de la lista y deja persistente
          setNotifications(prev => [newNotification, ...prev]);
        } catch (error) {
          console.error("❌ Error al parsear el mensaje del WebSocket:", error);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error("❌ Error en WebSocket:", error);
      };

      socketRef.current.onclose = () => {
        console.warn("🔌 WebSocket cerrado");
        console.log("s+++++++++++++++++++++++++++++++++++++++++++++++++++++")
        setTimeout(setupWebSocket, 3000);
      };
    };

    setupWebSocket();

    return () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();  // Solo cerrar si está abierto
      }
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const userId = sessionStorage.getItem("cedula");
      const userRole = sessionStorage.getItem("rol");
      let processesResponse;
      if (userRole === "7") {
        processesResponse = await axios.get(`http://${API_BASE_URL}/api/procesos/usuario/${userId}/`);
      } else {
        processesResponse = await axios.get(`http://${API_BASE_URL}/api/procesos/`);
      }
      if (Array.isArray(processesResponse.data)) {
        setProcesses(
          processesResponse.data.map(proc => ({
            id: proc.proceso_id,
            name: proc.seriado_proceso,
            status: proc.estado
          }))
        );
      }
    } catch (error) {
      console.error("Error al actualizar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleViewProcess = (processId) => {
    setSelectedProcessId(processId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProcessId(null);
  };

  const getNotificationIcon = (type) => {
    return type === 'alert' 
      ? <AlertCircle className="text-red-500" size={18} /> 
      : <Bell className="text-blue-500" size={18} />;
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="text-green-500" size={16} />;
    if (status === 'pending')   return <Clock className="text-amber-500" size={16} />;
    return null;
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString('es-ES', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
    });

  return (
    <div className="flex h-screen w-full bg-gray-100 p-6">
      {/* Lista de procesos */}
      <div className="w-2/3 pr-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Lista de procesos</h2>
            <button 
              onClick={handleRefresh}
              className={`bg-white/20 hover:bg-white/30 text-white p-2 rounded transition-colors flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              <RefreshCw size={16} className={`${loading ? 'animate-spin' : ''} mr-1`} />
              <span>Actualizar</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-blue-500" size={30} />
              <span className="ml-3 text-gray-600 font-medium">Cargando procesos...</span>
            </div>
          ) : (
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Proceso</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.length > 0 ? (
                    processes.map((process) => (
                      <tr key={process.id} className="border-b hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-4 flex items-center">
                          <div className="p-2 bg-gray-100 rounded-full mr-3">
                            {getStatusIcon(process.status) || <span className="w-4 h-4 block" />}
                          </div>
                          <span className="font-medium text-gray-700">{process.name}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleViewProcess(process.id)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-md transition-colors font-medium"
                          >
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="py-8 text-center">
                        <div className="text-gray-500 flex flex-col items-center">
                          <AlertCircle size={40} className="text-gray-400 mb-2" />
                          <p className="font-medium">No hay procesos disponibles</p>
                          <p className="text-sm text-gray-400 mt-1">Intente actualizar o verificar sus credenciales</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Notificaciones */}
      <div className="w-1/3 pl-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Notificaciones y alertas</h2>
            {notifications.length > 0 && (
              <button 
                onClick={handleClearNotifications}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-md text-sm transition-colors"
              >
                Limpiar todo
              </button>
            )}
          </div>

          <div className="overflow-y-auto p-3" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 rounded-lg shadow-sm border-l-4 transition-all hover:shadow-md ${
                      notification.type === 'alert' 
                        ? 'bg-red-50 border-red-500' 
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${
                        notification.type === 'alert' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <span className={`ml-2 font-semibold ${
                        notification.type === 'alert' ? 'text-red-700' : 'text-blue-700'
                      }`}>
                        {notification.type === 'alert' ? 'Alerta' : 'Notificación'}
                      </span>
                      <span className="ml-auto text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        {formatDate(notification.timestamp)}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">{notification.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Bell size={40} className="text-gray-300 mb-3" />
                <p className="font-medium">No hay notificaciones</p>
                <p className="text-sm text-gray-400 mt-1">Las notificaciones aparecerán aquí</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <ModalConsulta
        isOpen={isModalOpen}
        onClose={closeModal}
        consultaId={selectedProcessId}
      />
    </div>
  );
};

export default ProcessListTable;

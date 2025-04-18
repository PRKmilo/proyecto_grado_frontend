import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

const CorrectionsListPage = () => {
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCorrections();
  }, []);

  const fetchCorrections = async () => {
    setLoading(true);
    try {
      const userId = sessionStorage.getItem('cedula');
      const response = await axios.get(`http://localhost:8000/api/correcciones/usuario/${userId}/`);
      setCorrections(response.data);
      corrections.map((c) => console.log(c.is_resolved))
    } catch (error) {
      console.error('Error al cargar correcciones:', error);
      setCorrections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchCorrections();
  };

  corrections.map((c) => console.log(c.is_resolved))
  return (
    <div className="flex h-screen w-full bg-gray-100 p-6">
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-md h-full overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Lista de correcciones</h2>
            <button
              onClick={handleRefresh}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded transition-colors flex items-center"
              disabled={loading}
            >
              <RefreshCw size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-blue-500" size={30} />
              <span className="ml-3 text-gray-600 font-medium">Cargando correcciones...</span>
            </div>
          ) : (
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 130px)' }}>
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-2 px-4">ID</th>
                    <th className="py-2 px-4">Descripción</th>
                    <th className="py-2 px-4">Comentario</th>
                    <th className="py-2 px-4">Línea</th>
                    <th className="py-2 px-4">Inicio</th>
                    <th className="py-2 px-4">Fin</th>
                    <th className="py-2 px-4">¿Resuelto?</th>
                  </tr>
                </thead>
                <tbody>
                  {corrections.length > 0 ? (
                    corrections.map((correction) => (
                    
                      <tr key={correction.id_correcion} className="border-b hover:bg-gray-100">
                        <td className="py-2 px-4">{correction.id_correcion}</td>
                        <td className="py-2 px-4">{correction.descripcion}</td>
                        <td className="py-2 px-4">{correction.comment}</td>
                        <td className="py-2 px-4">{correction.line_number}</td>
                        <td className="py-2 px-4">{correction.start_position}</td>
                        <td className="py-2 px-4">{correction.end_position}</td>
                        <td className="py-2 px-4">{correction.is_resolved ? 'Sí' : 'No'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500">
                        <AlertCircle size={40} className="mx-auto text-gray-400 mb-2" />
                        No hay correcciones disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorrectionsListPage;

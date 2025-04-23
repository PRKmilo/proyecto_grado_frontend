import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle, CheckCircle, Calendar, Clock, User, FileText, Activity } from 'lucide-react';
import API_BASE_URL from "../../config";

const ProcessForm = () => {
  const [formData, setFormData] = useState({
    proceso_id: '',
    usuario: '',
    seriado_proceso: '',
    estado: '',
    fecha_inicio: '',
    fecha_actualizacion: '',
    limite_tiempo: '',
    fecha_limite: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [estados, setEstados] = useState(['Activo', 'Pendiente', 'Finalizado', 'Cancelado']);

  // Obtener la fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    // Inicializar fechas por defecto
    setFormData(prevData => ({
      ...prevData,
      fecha_inicio: getCurrentDate(),
      fecha_actualizacion: getCurrentDate()
    }));
  }, []);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // Si se modifica limite_tiempo, calcular fecha_limite
    if (name === 'limite_tiempo' && formData.fecha_inicio) {
      const startDate = new Date(formData.fecha_inicio);
      const days = parseInt(value, 10) || 0;
      const limitDate = new Date(startDate);
      limitDate.setDate(limitDate.getDate() + days);
      
      const year = limitDate.getFullYear();
      const month = String(limitDate.getMonth() + 1).padStart(2, '0');
      const day = String(limitDate.getDate()).padStart(2, '0');
      
      setFormData(prevData => ({
        ...prevData,
        fecha_limite: `${year}-${month}-${day}`
      }));
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Siempre crear un nuevo proceso
      const response = await axios.post(`http://${API_BASE_URL}/api/procesos/`, formData);

      setSuccess(true);
      setFormData(prev => ({
        ...prev,
        proceso_id: response.data.proceso_id || prev.proceso_id
      }));
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error al guardar el proceso:', err);
      setError(err.response?.data?.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <FileText className="mr-2 text-blue-600" />
        Crear Nuevo Proceso
      </h2>

      {/* Mensajes de estado */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
          <AlertCircle className="text-red-500 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-700">Error</p>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start">
          <CheckCircle className="text-green-500 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-700">¡Éxito!</p>
            <p className="text-green-600">El proceso ha sido guardado correctamente.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Usuario */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <User size={16} className="mr-1 text-blue-600" />
              Usuario Beneficiario
            </label>
            <input
              type="text"
              name="usuario"
              value={formData.usuario}
              onChange={handleChange}
              placeholder="Ingrese la cedula del usuario"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Seriado del Proceso */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FileText size={16} className="mr-1 text-blue-600" />
              Número de Serie
            </label>
            <div className="flex">
              <input
                type="text"
                name="seriado_proceso"
                value={formData.seriado_proceso}
                onChange={handleChange}
                placeholder="Número de Serie"
                className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Estado */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Activity size={16} className="mr-1 text-blue-600" />
              Estado
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccione un estado</option>
              {estados.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>

          {/* Fecha de Inicio */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Calendar size={16} className="mr-1 text-blue-600" />
              Fecha de Inicio
            </label>
            <input
              type="date"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Fecha de Actualización */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Calendar size={16} className="mr-1 text-blue-600" />
              Fecha de Actualización
            </label>
            <input
              type="date"
              name="fecha_actualizacion"
              value={formData.fecha_actualizacion}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Límite de Tiempo (días) */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Clock size={16} className="mr-1 text-blue-600" />
              Límite de Tiempo (días)
            </label>
            <input
              type="number"
              name="limite_tiempo"
              value={formData.limite_tiempo}
              onChange={handleChange}
              min="0"
              placeholder="Número de días"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Fecha Límite (calculada automáticamente) */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Calendar size={16} className="mr-1 text-blue-600" />
              Fecha Límite
            </label>
            <input
              type="date"
              name="fecha_limite"
              value={formData.fecha_limite}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Calculada automáticamente según la fecha de inicio y el límite de tiempo
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => {
              setFormData({
                proceso_id: '',
                usuario: '',
                seriado_proceso: '',
                estado: '',
                fecha_inicio: getCurrentDate(),
                fecha_actualizacion: getCurrentDate(),
                limite_tiempo: '',
                fecha_limite: ''
              });
              setError(null);
              setSuccess(false);
            }}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md flex items-center ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
            } transition-colors`}
          >
            <Save size={18} className="mr-2" />
            {loading ? 'Guardando...' : 'Guardar Proceso'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProcessForm;

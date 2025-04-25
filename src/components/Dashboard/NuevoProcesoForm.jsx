import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, User, FileText, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from "../../config";

const NuevoProcesoForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    numero_escritura: '',
    proceso_escritura: '',
    nombre_notaria: '',
    fecha_otorgamiento: '',
    fecha_inicio: '',
    municipio: '',
    descripcion_movimiento: '',
    direccion_predio: '',
    direccion_smart_contract: '',
    cedula_catastral: '',
    beneficiario_id: '',
    user_id: sessionStorage.getItem("cedula") || '', 
    archivo_txt: null
  });

  const [errors, setErrors] = useState({});
  const [procesosList, setProcesosList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch processes from the endpoint
  useEffect(() => {
    const fetchProcesos = async () => {
      setIsLoading(true);
      try {
        console.log()
        // Replace with your actual API endpoint for processes
        const response = await axios.get(`http://${API_BASE_URL}/api/procesos/`);
        console.log(response)
        console.log(sessionStorage)
        setProcesosList(response.data);
      } catch (error) {
        console.error('Error fetching processes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProcesos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(formData)
    setFormData(prev => ({
      ...prev,
      [name]: value 
    }));
    console.log("linea 55 xxxxxxxxxxxxxxxxxxxxxxxxxxx")
    console.log(formData)
    setFormData(prev => ({
      ...prev, 
      user_id: sessionStorage.getItem("cedula")
    }));
    console.log("linea 60 -----------------------------------------")
    console.log(formData)
    // Clear any existing error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      archivo_txt: e.target.files[0]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'numero_escritura', 'proceso_escritura', 'nombre_notaria', 
      'fecha_otorgamiento', 'fecha_inicio', 'municipio',
      'beneficiario_id'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'Este campo es requerido';
      }
    });

    // Additional validation for ID fields
    if (formData.beneficiario_id && !/^\d{6,10}$/.test(formData.beneficiario_id)) {
      newErrors.beneficiario_id = 'Ingrese un número de identificación válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitFormData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        submitFormData.append(key, formData[key]);
      }
    });

    try {
      // Replace with your actual API endpoint
      const response = await axios.post(`http://${API_BASE_URL}/api/escrituras/`, submitFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Escritura creada correctamente'+formData.user_id);
      alert(formData.user_id);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al crear proceso:', error);
      alert('Hubo un error al crear el proceso');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-800 to-blue-700 text-white px-6 py-4 flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-4 hover:bg-blue-700 p-2 rounded-full transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-semibold">Crear Nueva Escritura Formulario</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <input 
          type="hidden" 
          name="user_id" 
          value={formData.user_id} 
          />
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Número de Escritura</label>
              <input
                type="text"
                name="numero_escritura"
                value={formData.numero_escritura}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 
                  ${errors.numero_escritura 
                    ? 'border-red-500 focus:ring-red-300' 
                    : 'focus:ring-blue-500'}`}
                placeholder="Ingrese número de escritura"
              />
              {errors.numero_escritura && (
                <p className="text-red-500 text-sm mt-1">{errors.numero_escritura}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Proceso de Escritura</label>
              <select
                name="proceso_escritura"
                value={formData.proceso_escritura}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 
                  ${errors.proceso_escritura 
                    ? 'border-red-500 focus:ring-red-300' 
                    : 'focus:ring-blue-500'}`}
              >
                <option value="">Seleccione un proceso</option>
                {isLoading ? (
                  <option disabled>Cargando procesos...</option>
                ) : (
                  procesosList.map(proceso => (
                    <option 
                      key={proceso.proceso_id} 
                      value={proceso.proceso_id}
                    >
                      {proceso.seriado_proceso} 
                    </option>
                  ))
                )}
              </select>
              {errors.proceso_escritura && (
                <p className="text-red-500 text-sm mt-1">{errors.proceso_escritura}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Numero de Notaría</label>
              <input
                type="text"
                name="nombre_notaria"
                value={formData.nombre_notaria}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 
                  ${errors.nombre_notaria 
                    ? 'border-red-500 focus:ring-red-300' 
                    : 'focus:ring-blue-500'}`}
                placeholder=""
              />
              {errors.nombre_notaria && (
                <p className="text-red-500 text-sm mt-1">{errors.nombre_notaria}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Fecha de Otorgamiento</label>
              <input
                type="date"
                name="fecha_otorgamiento"
                value={formData.fecha_otorgamiento}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 
                  ${errors.fecha_otorgamiento 
                    ? 'border-red-500 focus:ring-red-300' 
                    : 'focus:ring-blue-500'}`}
              />
              {errors.fecha_otorgamiento && (
                <p className="text-red-500 text-sm mt-1">{errors.fecha_otorgamiento}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Fecha de registro</label>
              <input
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 
                  ${errors.fecha_inicio 
                    ? 'border-red-500 focus:ring-red-300' 
                    : 'focus:ring-blue-500'}`}
              />
              {errors.fecha_inicio && (
                <p className="text-red-500 text-sm mt-1">{errors.fecha_inicio}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Municipio</label>
              <input
                type="text"
                name="municipio"
                value={formData.municipio}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 
                  ${errors.municipio 
                    ? 'border-red-500 focus:ring-red-300' 
                    : 'focus:ring-blue-500'}`}
                placeholder="Ingrese municipio"
              />
              {errors.municipio && (
                <p className="text-red-500 text-sm mt-1">{errors.municipio}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Descripción de Movimiento</label>
              <textarea
                name="descripcion_movimiento"
                value={formData.descripcion_movimiento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describa el movimiento"
                rows="3"
              ></textarea>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Dirección del Predio</label>
              <input
                type="text"
                name="direccion_predio"
                value={formData.direccion_predio}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dirección del predio"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Cédula Catastral</label>
              <input
                type="text"
                name="cedula_catastral"
                value={formData.cedula_catastral}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cédula catastral"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2 flex items-center">
                <User className="mr-2 text-blue-600" size={18} />
                Cédula de Beneficiario
              </label>
              <input
                type="text"
                name="beneficiario_id"
                value={formData.beneficiario_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
                  ${errors.beneficiario_id 
                    ? 'border-red-500 focus:ring-red-300' 
                    : 'border-gray-300 focus:ring-blue-500'}`}
                placeholder="Número de identificación"
              />
              {errors.beneficiario_id && (
                <p className="text-red-500 text-sm mt-1">{errors.beneficiario_id}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Archivo PDF</label>
              <input
                type="file"
                name="archivo_txt"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition"
            >
              <Save size={20} />
              <span>Guardar Proceso</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevoProcesoForm;

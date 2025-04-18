import React from 'react';
import { X, Upload, FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateProcessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-blue-800 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">Crear Nuevo Proceso</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Seleccione el método para crear un nuevo proceso:
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Opción 1: Subir desde archivo */}
            <Link to="/nuevo-proceso">
              <button
                className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                onClick={() => console.log('Subir desde archivo')}
              >
                <div className="bg-blue-100 p-3 rounded-full mb-3">
                  <Upload size={24} className="text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-800 mb-2">Subir desde Archivo</h4>
                <p className="text-gray-500 text-sm text-center">
                  Importe datos desde un archivo existente
                </p>
              </button>
            </Link>

            {/* Opción 2: Nueva escritura */}
            <Link to="/escribir-proceso">
              <button
                className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                onClick={() => console.log(sessionStorage)}
              >
                <div className="bg-blue-100 p-3 rounded-full mb-3">
                  <FileText size={24} className="text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-800 mb-2">Nueva Escritura</h4>
                <p className="text-gray-500 text-sm text-center">
                  Crear un nuevo proceso manualmente
                </p>
              </button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProcessModal;
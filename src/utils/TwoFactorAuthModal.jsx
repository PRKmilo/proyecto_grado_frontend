import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from "qrcode.react";

const TwoFactorAuthModal = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [secret, setSecret] = useState(null);
  const [error, setError] = useState('');
  
  if (!isOpen) return null;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = sessionStorage.getItem('token');
      console.log(token);
      
      const cedula = sessionStorage.getItem("cedula");
      
      if (!token) {
        setError('No se encontró token de autenticación');
        setLoading(false);
        return;
      }
      console.log("Datos enviados:", { cedula, password });

      const response = await axios.post(
        'http://127.0.0.1:8000/api/mfa/activar/', 
        { cedula, password }, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(response.data);
      
      if (response.data && response.data.qr_uri) {
        setQrCodeUrl(response.data.qr_uri);
        if (response.data.secret) {
          setSecret(response.data.secret);
        }
      } else {
        setError('No se pudo generar el código QR');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al conectar con el servidor');
      console.error('Error generando 2FA:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Generar Autenticación de Dos Factores</h2>
        
        {qrCodeUrl ? (
          <div className="flex flex-col items-center">
            <p className="mb-4 text-gray-700">Escanee este código QR con su aplicación de autenticación:</p>
            <div className="mb-4 p-2 border border-gray-300 rounded bg-white">
              <QRCodeCanvas 
                value={qrCodeUrl} 
                size={256} 
                level="H" 
                includeMargin={true}
                renderAs="svg"
                className="w-64 h-64"
              />
            </div>
            
            {secret && (
              <div className="mb-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Si no puede escanear el código QR, ingrese este código en su aplicación:</p>
                <p className="font-mono bg-gray-100 p-2 rounded select-all text-center">{secret}</p>
              </div>
            )}
            
            <button
              className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="mb-4 text-gray-600">
              Ingrese su contraseña para generar un código de autenticación de dos factores.
            </p>
            
            <div className="mb-4">
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
                disabled={loading}
              >
                {loading ? 'Generando...' : 'Generar 2FA'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TwoFactorAuthModal;

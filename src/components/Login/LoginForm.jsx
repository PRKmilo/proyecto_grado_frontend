import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { User, Lock, LogIn, AlertTriangle, CheckCircle, Shield, Mail, Key } from "lucide-react";
import API_BASE_URL from "../../config";

function LoginForm() {
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMfaForm, setShowMfaForm] = useState(false);
  const navigate = useNavigate();

  const handleRegularLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!cedula || !password) {
      showNotification("Por favor complete todos los campos requeridos", "error");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `http://${API_BASE_URL}/api/login/`,
        {
          cedula: cedula,
          password: password
        }
      );
      console.log(response.data);

    if (response.data.mfa_required) {
      setEmail(response.data.email); // si te llega el correo desde el backend
      setShowMfaForm(true);
      return;
    }


      if (response.status === 200) {
        console.log(response.data);
        // Almacenamos los datos en sesión
        sessionStorage.setItem("cedula", cedula);
        sessionStorage.setItem("rol", response.data.usuario_rol);
        sessionStorage.setItem("token", response.data.access);
        
        showNotification("Inicio de sesión exitoso", "success");
        navigate("/dashboard")
      }
    } catch (error) {
      const message = error.response?.data?.message || "Credenciales inválidas";
      showNotification(`Error: ${message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerification = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !code) {
      showNotification("Por favor complete todos los campos requeridos", "error");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `http://${API_BASE_URL}/api/mfa/verificar/`,
        {
          email: email,
          codigo: code
        }
      );

      if (response.status === 200) {
        // Almacenamos los datos en sesión
        sessionStorage.setItem("cedula", email);
        sessionStorage.setItem("rol", response.data.usuario_rol);
        sessionStorage.setItem("token", response.data.access);
	        
        showNotification("Inicio de sesión exitoso", "success");
	navigate("/dashboard")
	/*
        if(response.data.rol_id === "4"){
	  navigate("/notary");
        }
        if(rol === 5){
	  console.log("Ingreso al path 5");
          navigate("/judge");
        }
        if(rol === 6){
	  console.log("Ingreso al path 6");
          navigate("/endorser");
        }
        if(rol === 7){
	  console.log("Ingreso al path 7");
          navigate("/client");
        }*/
      }
    } catch (error) {
      const message = error.response?.data?.message || "Código 2FA inválido";
      showNotification(`Error: ${message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-md text-white text-sm font-medium shadow-lg transition-all duration-500 flex items-center space-x-2 ${
      type === "success" ? "bg-green-700" : "bg-red-700"
    }`;
    
    const icon = document.createElement("span");
    icon.innerHTML = type === "success" 
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
    
    const textSpan = document.createElement("span");
    textSpan.textContent = message;
    
    notification.appendChild(icon);
    notification.appendChild(textSpan);
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => document.body.removeChild(notification), 500);
    }, 3000);
  };

  const renderRegularLoginForm = () => (
    <div>
      <form onSubmit={handleRegularLogin} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Cédula
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
              placeholder="Número de cédula"
              required
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Contraseña
            </label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
              placeholder="Contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2.5 rounded-md transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => setShowMfaForm(true)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-md transition-all flex items-center justify-center space-x-2"
        >
          <Key className="w-5 h-5" />
          <span>Autenticar con 2FA</span>
        </button>
      </div>
    </div>
  );

  const renderMfaForm = () => (
    <form onSubmit={handleMfaVerification} className="space-y-5">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Correo Electrónico
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
            placeholder="Correo"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Código 2FA
          </label>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Key className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
            placeholder="Código"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2.5 rounded-md transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              <span>Verificar</span>
            </>
          )}
        </button>
      </div>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={() => setShowMfaForm(false)}
          className="text-blue-900 text-sm hover:underline"
        >
          Volver a inicio de sesión normal
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg flex overflow-hidden">
        {/* Left Side - Official Image */}
        <div className="hidden lg:block lg:w-2/5 bg-blue-900 relative">
          <div className="absolute inset-0 flex flex-col items-center justify-between p-8 text-white">
            <div className="w-full flex justify-center">
              <Shield className="w-16 h-16" />
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Portal Oficial</h2>
              <p className="text-blue-200 mb-6">Sistema Integral de Administración</p>
              <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
            </div>
            
            <div className="text-xs text-blue-200 text-center">
              <p>© 2025 Todos los derechos reservados</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-3/5 p-8">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <Shield className="w-8 h-8 text-blue-900" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                Acceso al Sistema
              </h1>
              <p className="text-gray-600 text-sm">
                {showMfaForm 
                  ? "Ingrese su correo y código de autenticación de dos factores" 
                  : "Ingrese sus credenciales para acceder al portal oficial"}
              </p>
            </div>

            {/* Form */}
            {showMfaForm ? renderMfaForm() : renderRegularLoginForm()}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-600">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  Este es un sistema gubernamental de uso oficial. El acceso no autorizado está prohibido y sujeto a las sanciones establecidas por la ley.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;

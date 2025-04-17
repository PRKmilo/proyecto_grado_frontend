import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-6 py-12">
      <div className="text-center max-w-xl">
        {/* SVG Ilustración */}
        <div className="w-full max-w-md mx-auto mb-12 relative">
          <svg
            className="w-full h-auto"
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Fondo circular */}
            <circle cx="200" cy="200" r="120" fill="#EEF2FF" />

            {/* 404 texto */}
            <g className="select-none">
              <text
                x="90"
                y="240"
                fontSize="120"
                fontWeight="bold"
                fill="#4F46E5"
                opacity="0.2"
              >
                404
              </text>
              <text
                x="95"
                y="235"
                fontSize="120"
                fontWeight="bold"
                fill="#4F46E5"
              >
                404
              </text>
            </g>

            {/* Cara triste animada */}
            <g className="animate-bounce" style={{ animationDuration: "2s" }}>
              <circle cx="160" cy="160" r="8" fill="#4F46E5" />
              <circle cx="240" cy="160" r="8" fill="#4F46E5" />
              <path
                d="M160 200 Q200 180 240 200"
                stroke="#4F46E5"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </svg>
        </div>

        {/* Texto */}
        <div className="space-y-6 mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            ¡Página no encontrada!
          </h1>
          <p className="text-gray-600 text-lg">
            Lo sentimos, la página que estás buscando no existe o ha sido
            movida.
          </p>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Volver atrás
          </button>
          <button
            onClick={() => navigate("/")}
            className="group inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

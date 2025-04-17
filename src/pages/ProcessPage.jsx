import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import ProcessForm from '../components/Dashboard/ProcessForm';

const ProcessPage = () => {
  // Estado para controlar si el sidebar está colapsado
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Función para manejar el cambio de estado del sidebar
  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onToggle={handleSidebarToggle} />
      
      <div 
        className={`transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'ml-20' : 'ml-72'
        } flex-1 p-6 overflow-auto`}
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <ProcessForm/>
        </div>
      </div>
    </div>
  );
};

export default ProcessPage;
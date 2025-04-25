import React, { useState } from 'react';
import {
    Layout,
    User,
    FileText,
    Eye,
    Edit,
    Settings,
    LogOut,
    Shield,
    ChevronRight,
    ChevronLeft,
    PlusCircle,
    Activity,
    Moon
} from 'lucide-react';
import CreateProcessModal from '../Modals/CreateProcessModal';
import TwoFactorAuthModal from '../../utils/TwoFactorAuthModal';
import { Link } from 'react-router-dom';

const Sidebar = ({ onToggle }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [darkMode, setDarkMode] = useState(true);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const open2FAModal = () => setIs2FAModalOpen(true);
    const close2FAModal = () => setIs2FAModalOpen(false);

    const toggleSidebar = () => {
        const newCollapsedState = !isCollapsed;
        setIsCollapsed(newCollapsedState);
        // Notificar al componente padre sobre el cambio
        if (onToggle) {
            onToggle(newCollapsedState);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("cedula");
        sessionStorage.removeItem("rol");
        sessionStorage.removeItem("token");
    };

    const rol = parseInt(sessionStorage.getItem("rol"), 10);

    return (
        <>
            <div className={`flex flex-col justify-between h-screen bg-gradient-to-b ${darkMode ? 'from-gray-900 to-gray-950' : 'from-blue-50 to-blue-100'} ${isCollapsed ? 'w-20' : 'w-72'} ${darkMode ? 'text-white' : 'text-gray-800'} fixed left-0 top-0 shadow-xl transition-all duration-300 ease-in-out z-10`}>
                {/* Toggle button with improved hover effect */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-20 bg-blue-600 hover:bg-blue-700 rounded-full p-1.5 shadow-lg transition-all duration-200 ease-in-out hover:scale-110"
                >
                    {isCollapsed ? <ChevronRight size={16} className="text-white" /> : <ChevronLeft size={16} className="text-white" />}
                </button>

                {/* Top section with menu items */}
                <div className="flex flex-col">
                    {/* Application logo/title with enhanced styling */}
                    <Link to="/dashboard">
                        <div className={`p-5 border-b ${darkMode ? 'border-gray-700' : 'border-blue-200'} flex items-center justify-center md:justify-start hover:bg-opacity-90 transition-all duration-200`}>
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center mr-3 shadow-md">
                                    <Layout className="text-white" size={20} />
                                </div>
                                {!isCollapsed && (
                                    <div className="flex items-center">
                                        <img
                                            src="https://i.imgur.com/gkVoO1L.png"
                                            alt="Logo"
                                            className="w-8 h-8 mr-2 drop-shadow-md"
                                        />
                                        <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400 drop-shadow-sm">
                                            RestituChain
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>

                    {/* Menu items with enhanced visual feedback */}
                    <div className="flex flex-col py-6 space-y-2">
                        {/* Nueva opción: Crear nuevo proceso */}
                        {rol !== 7 && rol === 4 && (
                            <Link to="/process">
                            <button
                                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 ${darkMode ? 'hover:bg-blue-600/20' : 'hover:bg-blue-200'} rounded-lg mx-3 transition-all group`}

                            >
                                <div className="flex items-center">
                                    <div className={`${darkMode ? 'bg-blue-500/20' : 'bg-blue-500/30'} rounded-lg p-2.5 group-hover:scale-105 transition-all`}>
                                        <PlusCircle size={18} className="text-blue-400" />
                                    </div>
                                    {!isCollapsed && <span className="ml-3 font-medium">Crear nuevo proceso</span>}
                                </div>
                                {!isCollapsed && <ChevronRight size={16} className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />}
                            </button>
                            </Link>
                        )}
                        {rol !== 7 && rol === 4 && (
                            <button
                                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 ${darkMode ? 'hover:bg-blue-600/20' : 'hover:bg-blue-200'} rounded-lg mx-3 transition-all group`}
                                onClick={openModal}
                            >
                                <div className="flex items-center">
                                    <div className={`${darkMode ? 'bg-blue-500/20' : 'bg-blue-500/30'} rounded-lg p-2.5 group-hover:scale-105 transition-all`}>
                                        <FileText size={18} className="text-blue-400" />
                                    </div>
                                    {!isCollapsed && <span className="ml-3 font-medium">Crear nueva escritura</span>}
                                </div>
                                {!isCollapsed && <ChevronRight size={16} className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />}
                            </button>
                        )}   


                        {rol === 4 && (
                            <Link to="/correccion-lista" className='block mx-3'>
                            <button className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 ${darkMode ? 'hover:bg-blue-600/20' : 'hover:bg-blue-200'} rounded-lg mx-3 transition-all group`}>
                                <div className="flex items-center">
                                    <div className={`${darkMode ? 'bg-blue-500/20' : 'bg-blue-500/30'} rounded-lg p-2.5 group-hover:scale-105 transition-all`}>
                                        <Edit size={18} className="text-blue-400" />
                                    </div>
                                    {!isCollapsed && <span className="ml-3 font-medium">Corrección procesos</span>}
                                </div>
                                {!isCollapsed && <ChevronRight size={16} className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />}
                            </button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Bottom section with user and settings - enhanced UI */}
                <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-blue-200'} mt-auto`}>
                    <div className={`p-4 flex ${isCollapsed ? 'justify-center' : 'items-center'} ${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-blue-200/70'} transition-colors`}>
                        <div className={`${darkMode ? 'bg-blue-500/20' : 'bg-blue-500/30'} rounded-full p-2.5 flex-shrink-0`}>
                            <User size={18} className="text-blue-400" />
                        </div>
                        {!isCollapsed && (
                            <div className="ml-3">
                                <span className="text-sm font-medium truncate">{sessionStorage.getItem("cedula")}</span>
                                <p className="text-xs text-gray-400">Usuario activo</p>
                            </div>
                        )}
                    </div>
                    <div className="space-y-1 pb-4">


                        <button
                            className={`flex items-center ${isCollapsed ? 'justify-center' : ''} px-4 py-3 mx-3 w-auto ${darkMode ? 'hover:bg-blue-600/20' : 'hover:bg-blue-200'} rounded-lg transition-all group`}
                            onClick={open2FAModal}
                        >
                            <div className={`${darkMode ? 'bg-blue-500/20' : 'bg-blue-500/30'} rounded-lg p-2.5 group-hover:scale-105 transition-all`}>
                                <Shield size={18} className="text-blue-400" />
                            </div>
                            {!isCollapsed && <span className="ml-3 font-medium">Generar 2FA</span>}
                        </button>

                        <Link to="/">
                            <button
                                className={`flex items-center ${isCollapsed ? 'justify-center' : ''} px-4 py-3 mx-3 w-auto hover:bg-red-500/20 rounded-lg transition-all group`}
                                onClick={handleLogout}
                            >
                                <div className="bg-red-500/20 rounded-lg p-2.5 group-hover:scale-105 transition-all">
                                    <LogOut size={18} className="text-red-400" />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium">Cerrar Sesión</span>}
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Modal para crear proceso */}
            <CreateProcessModal isOpen={isModalOpen} onClose={closeModal} />

            {/* Modal para generar 2FA */}
            <TwoFactorAuthModal isOpen={is2FAModalOpen} onClose={close2FAModal} />
        </>
    );
};

export default Sidebar;

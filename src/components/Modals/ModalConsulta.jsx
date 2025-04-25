import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config";

const ModalConsulta = ({ isOpen, onClose, consultaId }) => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [estadoProcesos, setEstadoProcesos] = useState({});
    const [escriturasDesbloqueadas, setEscriturasDesbloqueadas] = useState({});
    const [modalValidacion, setModalValidacion] = useState({ open: false, escrituraId: null });
    const [modalConfirmacion, setModalConfirmacion] = useState({ open: false, escrituraId: null, validar: null });
    const [selectedItem, setSelectedItem] = useState(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [correccionData, setCorreccionData] = useState({
        mensaje: "",
        posicionInicial: "",
        posicionFinal: ""
    });
    const modalRef = useRef(null);
    const navigate = useNavigate();
    const [estadoEscrituras, setEstadoEscrituras] = useState({}); 
    let API_USE = `http://${API_BASE_URL}/api/validar-smart-contract/`;

    // Filtros
    const [filtros, setFiltros] = useState({
        busqueda: "",
        campo: "todos", // todos, numero_escritura, nombre_notaria, etc.
        fecha: "",
        municipio: "",
        mostrarDesbloqueadas: false
    });

    // Lista de municipios únicos para el select
    const [municipios, setMunicipios] = useState([]);
    if(sessionStorage.getItem("rol") === "7"){
        API_USE = `http://${API_BASE_URL}/api/validar-beneficiario/`;
    }

    useEffect(() => {
        if (isOpen && consultaId) {
            setLoading(true);
            axios.get(`http://${API_BASE_URL}/api/procesos/escrituras/${consultaId}`)
                .then(response => {
                    setData(response.data);
                    setFilteredData(response.data);
                    setLoading(false);

		    response.data.forEach(item => {
	                consultarEstadoEscritura(item.numero_escritura);
	            });

                    // Extraer municipios únicos para el filtro
                    const uniqueMunicipios = [...new Set(response.data.map(item => item.municipio))];
                    setMunicipios(uniqueMunicipios);
                })
                .catch(() => {
                    setError("Error al cargar la información.");
                    setLoading(false);
                });
        }
    }, [isOpen, consultaId]);
    // Efecto para aplicar filtros cuando cambian
    useEffect(() => {
        aplicarFiltros();
    }, [filtros, data, escriturasDesbloqueadas]);

    // Scroll event listener to show/hide scroll button
    useEffect(() => {
        const handleScroll = () => {
            if (modalRef.current) {
                if (modalRef.current.scrollTop > 300) {
                    setShowScrollButton(true);
                } else {
                    setShowScrollButton(false);
                }
            }
        };

        const modalElement = modalRef.current;
        if (modalElement) {
            modalElement.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (modalElement) {
                modalElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, [isOpen]);

    const scrollToTop = () => {
        if (modalRef.current) {
            modalRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    const aplicarFiltros = () => {
        let resultado = [...data];

        // Filtrar por texto de búsqueda
        if (filtros.busqueda.trim() !== "") {
            const busquedaLower = filtros.busqueda.toLowerCase();

            if (filtros.campo === "todos") {
                resultado = resultado.filter(item =>
                    item.numero_escritura?.toString().toLowerCase().includes(busquedaLower) ||
                    item.nombre_notaria?.toLowerCase().includes(busquedaLower) ||
                    item.cedula_catastral?.toLowerCase().includes(busquedaLower) ||
                    item.direccion_predio?.toLowerCase().includes(busquedaLower) ||
                    item.municipio?.toLowerCase().includes(busquedaLower) ||
                    item.descripcion_movimiento?.toLowerCase().includes(busquedaLower)
                );
            } else {
                resultado = resultado.filter(item =>
                    item[filtros.campo]?.toString().toLowerCase().includes(busquedaLower)
                );
            }
        }

        // Filtrar por fecha
        if (filtros.fecha) {
            const fechaSeleccionada = new Date(filtros.fecha);
            resultado = resultado.filter(item => {
                const fechaItem = new Date(item.fecha_otorgamiento);
                return fechaItem.toDateString() === fechaSeleccionada.toDateString();
            });
        }

        // Filtrar por municipio
        if (filtros.municipio) {
            resultado = resultado.filter(item => item.municipio === filtros.municipio);
        }

        // Filtrar por estado de desbloqueo
        if (filtros.mostrarDesbloqueadas) {
            resultado = resultado.filter(item => escriturasDesbloqueadas[item.numero_escritura]);
        }

        setFilteredData(resultado);
    };

    const handleFiltroChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const resetFiltros = () => {
        setFiltros({
            busqueda: "",
            campo: "todos",
            fecha: "",
            municipio: "",
            mostrarDesbloqueadas: false
        });
    };

    const handleCorreccionChange = (e) => {
        const { name, value } = e.target;
        setCorreccionData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const consultarEstadoProceso = (escrituraId) => {
        axios.get(`http://${API_BASE_URL}/api/consultar-etapa/${escrituraId}`)
            .then(response => {
                console.log(response.data)
                setEstadoProcesos(prev => ({ ...prev, [escrituraId]: response.data }));
            })
            .catch(err => {
                console.error("Error al obtener el estado del proceso", err);
            });
    };

    const consultarEstadoEscritura = (escrituraId) => {
        axios.get(`http://${API_BASE_URL}/api/consultar-etapa/${escrituraId}`)
            .then(response => {
                setEstadoEscrituras(prev => ({
                    ...prev,
		    [escrituraId]: response.data
	        }));
            console.log("Verificacion estado",response.data);
	    console.log("Verificacion EstadoEscritura",estadoEscrituras);
	    })
            .catch(err => {
                console.error("Error al obtener el estado del proceso", err);
            });
    };

    const corregirEscritura = (escrituraId, direccionURLArchivo) => {
        const cleanURL = direccionURLArchivo.split('?')[0];
        console.log(direccionURLArchivo)

        if (/\.txt$/i.test(cleanURL)) {
            navigate(`/modal-txt/${escrituraId}`, { state: { url: direccionURLArchivo } });
        } else if (/\.pdf$/i.test(cleanURL)) {
            navigate(`/modal-pdf/${escrituraId}`, { state: { url: direccionURLArchivo } });
        } else {
            console.log('Tipo de archivo no soportado');
        }
    };

    const desbloquearEscritura = (escrituraId) => {
        const cedula = sessionStorage.getItem("cedula");
        const role = sessionStorage.getItem("rol");
        const password = prompt("🔒 Ingrese su contraseña:\n\n(El texto se verá en pantalla por seguridad del sistema)");

            if (password) {
                const peticion1 = axios.post(`http://${API_BASE_URL}/api/desbloquear-cuenta/${escrituraId}/`, {
                    rol_id: role,
                    password,
                    user_id: cedula
                });

                const peticion2 = axios.post(`http://${API_BASE_URL}/api/rol-validacion/${escrituraId}/`, {
                    escritura_id: escrituraId,
                    role_id: role
                });

                Promise.all([peticion1, peticion2])
                    .then(([response1, response2]) => {
                        sessionStorage.setItem("credential", response1.data.credential);
                        sessionStorage.setItem("nombre-rol", response2.data.resultado_rol)
                        alert("Escritura desbloqueada correctamente. Ahora puede validarla.");
                        setEscriturasDesbloqueadas(prev => ({ ...prev, [escrituraId]: true }));
                    })
                    .catch(() => {
                        alert("Error al desbloquear la escritura");
                    });
            }
        };

    const abrirModalValidacion = (item) => {
        setSelectedItem(item);
        setModalValidacion({ open: true, escrituraId: item.numero_escritura, direccionSmartContract: item.direccion_smart_contract });
    };

    const abrirModalConfirmacion = (escrituraId, direccionSmartContract, validar) => {
        if (!validar) {
            // Si es "No Validar", mostramos el formulario de corrección
            setModalValidacion(prev => ({ 
                ...prev, 
                showCorreccionForm: true,
                validar: false
            }));
            return;
        }
        
        // Si es "Validar", procedemos directamente a la confirmación
        setModalValidacion({ open: false, escrituraId: null, direccionSmartContract: null });
        setModalConfirmacion({ open: true, escrituraId, validar, direccionSmartContract });
    };

    const confirmarNoValidarConCorreccion = () => {
        if (!correccionData.mensaje) {
            alert("Por favor ingrese un mensaje de corrección");
            return;
        }

        setModalValidacion({ open: false, escrituraId: null, direccionSmartContract: null });
        setModalConfirmacion({ 
            open: true, 
            escrituraId: modalValidacion.escrituraId, 
            validar: false, 
            direccionSmartContract: modalValidacion.direccionSmartContract,
            correccionData 
        });
    };

    const nombre_rol = sessionStorage.getItem("nombre-rol")
    const token_credential = sessionStorage.getItem("credential")
    const cedula = sessionStorage.getItem("cedula")
    const enviarValidacion = (escrituraId, validar, direccion_smart_contract, correccionData) => {
        console.log(direccion_smart_contract);

        const payload = { 
            respuesta: validar, 
            rol: nombre_rol, 
            token: token_credential, 
            id_user: cedula, 
            numero_escritura: escrituraId, 
            direccion_smart_contract 
        };

        if (!validar && correccionData) {
            payload.mensaje_correccion = correccionData.mensaje;
            payload.posicion_inicial = correccionData.posicionInicial;
            payload.posicion_final = correccionData.posicionFinal;
        }

        axios.post(API_USE, payload)
            .then(() => {
                alert(`Escritura ${validar ? "validada" : "no validada"} correctamente.`);
                setModalConfirmacion({ open: false, escrituraId: null, validar: null });
                setCorreccionData({ mensaje: "", posicionInicial: "", posicionFinal: "" });
            })
            .catch(() => {
                alert("Error al procesar la validación.");
            });
    };

    const getStatusColorClass = (status) => {
        if (!status) return "bg-gray-200";
        const percentage = (status / 5) * 100;
        if (percentage <= 25) return "bg-red-500";
        if (percentage <= 50) return "bg-yellow-500";
        if (percentage <= 75) return "bg-blue-500";
        return "bg-green-500";
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>

            <div ref={modalRef} className="bg-white rounded-xl shadow-xl w-full max-w-3xl z-10 relative p-8 max-h-[85vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-6 border-b pb-4">Detalles de la Consulta</h3>

                {/* Panel de Filtros */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium text-gray-700">Filtros de búsqueda</h4>
                        <button
                            onClick={resetFiltros}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reiniciar filtros
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex">
                                <input
                                    type="text"
                                    name="busqueda"
                                    value={filtros.busqueda}
                                    onChange={handleFiltroChange}
                                    placeholder="Buscar..."
                                    className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <select
                                    name="campo"
                                    value={filtros.campo}
                                    onChange={handleFiltroChange}
                                    className="border border-l-0 border-gray-300 rounded-r-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="todos">Todos los campos</option>
                                    <option value="numero_escritura">Número escritura</option>
                                    <option value="nombre_notaria">Notaría</option>
                                    <option value="cedula_catastral">Cédula catastral</option>
                                    <option value="direccion_predio">Dirección predio</option>
                                    <option value="descripcion_movimiento">Descripción</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Fecha de otorgamiento</label>
                                <input
                                    type="date"
                                    name="fecha"
                                    value={filtros.fecha}
                                    onChange={handleFiltroChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Municipio</label>
                                <select
                                    name="municipio"
                                    value={filtros.municipio}
                                    onChange={handleFiltroChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Todos los municipios</option>
                                    {municipios.map((municipio, index) => (
                                        <option key={index} value={municipio}>{municipio}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center mt-2">
                                <input
                                    type="checkbox"
                                    id="mostrarDesbloqueadas"
                                    name="mostrarDesbloqueadas"
                                    checked={filtros.mostrarDesbloqueadas}
                                    onChange={handleFiltroChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="mostrarDesbloqueadas" className="ml-2 block text-sm text-gray-700">
                                    Mostrar solo escrituras desbloqueadas
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-gray-600">
                        {filteredData.length} resultados encontrados
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                    <p>{error}</p>
                </div>}

                {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                        <div key={index} className="p-6 bg-white rounded-lg mb-6 shadow border border-gray-200 hover:shadow-md transition-all">
                            {estadoProcesos[item.numero_escritura] !== undefined && (
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-gray-700">Estado del Proceso:</span>
                                        <span className="font-bold">{estadoProcesos[item.numero_escritura]}/5</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
                                        <div
                                            className={`h-5 transition-all ${getStatusColorClass(estadoProcesos[item.numero_escritura])}`}
                                            style={{ width: `${(estadoProcesos[item.numero_escritura] / 5) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">Número de Escritura</span>
                                    <span className="font-semibold">{item.numero_escritura}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">Notaría</span>
                                    <span className="font-semibold">{item.nombre_notaria}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">Fecha de Otorgamiento</span>
                                    <span className="font-semibold">{item.fecha_otorgamiento}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">Cédula Catastral</span>
                                    <span className="font-semibold">{item.cedula_catastral}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">Dirección del Predio</span>
                                    <span className="font-semibold">{item.direccion_predio}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">Municipio</span>
                                    <span className="font-semibold">{item.municipio}</span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <span className="text-sm text-gray-500 block mb-1">Descripción del Movimiento</span>
                                <p className="bg-gray-50 p-3 rounded border border-gray-200">{item.descripcion_movimiento}</p>
                            </div>

                            <div className="mb-6">
                                <span className="text-sm text-gray-500 block mb-1">Dirección del Smart Contract</span>
                                <p className="bg-gray-50 p-3 rounded border border-gray-200 font-mono text-sm overflow-x-auto">{item.direccion_smart_contract}</p>
                            </div>

                            {item.direccion_temporal_data && (
                                <div className="mb-6">
                                    <a
                                        href={
					  item.direccion_temporal_data.endsWith('.txt')
					  ? item.direccion_temporal_data2
					  : item.direccion_temporal_data
					}
                                        download
                                        className="flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Consultar PDF
                                    </a>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-3 mt-4">
                                <button
                                    onClick={() => consultarEstadoProceso(item.numero_escritura)}
                                    className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Consultar Estado
                                </button>

                                {escriturasDesbloqueadas[item.numero_escritura] ? (
                                    <button
                                        onClick={() => abrirModalValidacion(item)}
                                        className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Opciones de Validación
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => desbloquearEscritura(item.numero_escritura)}
                                            className="py-2 px-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition shadow flex items-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Desbloquear
                                        </button>
				{(sessionStorage.getItem("rol") === "4" && estadoEscrituras[item.numero_escritura] < 5) && (
                                        <button
                                            onClick={() => corregirEscritura(item.numero_escritura, item.direccion_temporal_data)}
                                            className="py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition shadow flex items-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Corregir
                                        </button>
						    )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    !loading && <div className="text-center text-gray-600 p-10 bg-gray-50 rounded-lg">No hay datos disponibles para esta consulta o ningún registro coincide con los filtros aplicados.</div>
                )}

                <button
                    onClick={onClose}
                    className="mt-6 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg w-full text-center transition font-semibold shadow-sm"
                >
                    Cerrar
                </button>

                {/* Botón para scrollear hacia arriba - aparece cuando se hace scroll */}
                {showScrollButton && (
                    <button
                        onClick={scrollToTop}
                        className="fixed bottom-8 right-8 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-50 flex items-center justify-center"
                        aria-label="Volver arriba"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Modal de Opciones de Validación */}
            {modalValidacion.open && selectedItem && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
                        <h4 className="text-xl font-bold mb-6 text-center border-b pb-3">Opciones de Validación</h4>

                        <div className="mb-6">
                            <p className="text-gray-700 mb-4">Está gestionando la validación de la escritura:</p>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                                <p><span className="font-medium">Número: </span>{selectedItem.numero_escritura}</p>
                                <p><span className="font-medium">Notaría: </span>{selectedItem.nombre_notaria}</p>
                                <p><span className="font-medium">Predio: </span>{selectedItem.direccion_predio}</p>
                            </div>
                            <p className="text-gray-700">Seleccione una de las siguientes opciones:</p>
                        </div>

                        {!modalValidacion.showCorreccionForm ? (
                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => abrirModalConfirmacion(modalValidacion.escrituraId, selectedItem.direccion_smart_contract, true)}
                                    className="py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow flex items-center justify-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Validar Escritura
                                </button>

                                <button
                                    onClick={() => abrirModalConfirmacion(modalValidacion.escrituraId, selectedItem.direccion_smart_contract, false)}
                                    className="py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow flex items-center justify-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    No Validar Escritura
                                </button>

                                <button
                                    onClick={() => setModalValidacion({ open: false, escrituraId: null })}
                                    className="py-3 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition mt-2"
                                >
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje de corrección</label>
                                    <textarea
                                        name="mensaje"
                                        value={correccionData.mensaje}
                                        onChange={handleCorreccionChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        placeholder="Describa los problemas encontrados..."
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Posición inicial</label>
                                        <input
                                            type="number"
                                            name="posicionInicial"
                                            value={correccionData.posicionInicial}
                                            onChange={handleCorreccionChange}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Número de línea"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Posición final</label>
                                        <input
                                            type="number"
                                            name="posicionFinal"
                                            value={correccionData.posicionFinal}
                                            onChange={handleCorreccionChange}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Número de línea"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        onClick={() => setModalValidacion({ open: false, escrituraId: null })}
                                        className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmarNoValidarConCorreccion}
                                        className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow flex items-center"
                                    >
                                        Enviar Corrección
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Confirmación */}
            {modalConfirmacion.open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
                        <div className="mb-6">
                            {modalConfirmacion.validar ? (
                                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            )}

                            <h4 className="text-xl font-bold mb-2">Confirmar acción</h4>
                            <p className="text-gray-700">
                                ¿Está seguro de {modalConfirmacion.validar ? "validar" : "NO validar"} esta escritura?
                            </p>
                            {!modalConfirmacion.validar && modalConfirmacion.correccionData && (
                                <div className="mt-4 text-left bg-yellow-50 p-3 rounded border border-yellow-200">
                                    <p className="font-medium text-yellow-800">Mensaje de corrección:</p>
                                    <p className="text-sm text-yellow-700">{modalConfirmacion.correccionData.mensaje}</p>
                                    <div className="flex gap-4 mt-2 text-xs">
                                        {modalConfirmacion.correccionData.posicionInicial && (
                                            <span>Posición inicial: {modalConfirmacion.correccionData.posicionInicial}</span>
                                        )}
                                        {modalConfirmacion.correccionData.posicionFinal && (
                                            <span>Posición final: {modalConfirmacion.correccionData.posicionFinal}</span>
                                        )}
                                    </div>
                                </div>
                            )}
                            <p className="text-gray-500 text-sm mt-2">Esta acción no se puede deshacer</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => enviarValidacion(
                                    modalConfirmacion.escrituraId, 
                                    modalConfirmacion.validar, 
                                    modalConfirmacion.direccionSmartContract,
                                    modalConfirmacion.correccionData
                                )}
                                className={`py-3 px-4 ${modalConfirmacion.validar ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg transition shadow`}
                            >
                                Sí, confirmar
                            </button>
                            <button
                                onClick={() => {
                                    setModalConfirmacion({ open: false, escrituraId: null, validar: null, direccionSmartContract: null });
                                    setCorreccionData({ mensaje: "", posicionInicial: "", posicionFinal: "" });
                                }}
                                className="py-3 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModalConsulta;

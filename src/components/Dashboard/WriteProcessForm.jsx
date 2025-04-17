import React, { useEffect, useState } from 'react';
import {
    Plus,
    Trash2,
    FileText,
    Save,
    X,
    User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import  { autoTable } from 'jspdf-autotable';

const WriteProcessForm = () => {
    const [fields, setFields] = useState([]);
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
        user_id: '',
        beneficiario_id: '',
    });

    const [errors, setErrors] = useState({});
    const [fieldTypes, setFieldTypes] = useState({});
    const [showAddFieldModal, setShowAddFieldModal] = useState(false);
    const [newFieldName, setNewFieldName] = useState('');
    const [procesosList, setProcesosList] = useState([]);
    const [newFieldType, setNewFieldType] = useState('text');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProcesos = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get('http://localhost:8000/api/procesos/');
                setProcesosList(response.data);
            } catch (error) {
                console.error('Error fetching processes:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProcesos();
    }, []);

    const addField = () => {
        if (!newFieldName.trim()) {
            alert('Por favor, ingrese un nombre para el campo');
            return;
        }

        const sanitizedFieldName = newFieldName.trim().toLowerCase().replace(/\s+/g, '_');

        if (fields.includes(sanitizedFieldName) || formData.hasOwnProperty(sanitizedFieldName)) {
            alert('Ya existe un campo con este nombre');
            return;
        }

        setFields([...fields, sanitizedFieldName]);
        setFieldTypes(prev => ({
            ...prev,
            [sanitizedFieldName]: newFieldType
        }));

        setFormData(prev => ({
            ...prev,
            [sanitizedFieldName]: ''
        }));

        setNewFieldName('');
        setNewFieldType('text');
        setShowAddFieldModal(false);
    };

    const removeField = (fieldToRemove) => {
        setFields(fields.filter(field => field !== fieldToRemove));
        const newFormData = { ...formData };
        const newFieldTypes = { ...fieldTypes };
        delete newFormData[fieldToRemove];
        delete newFieldTypes[fieldToRemove];
        setFormData(newFormData);
        setFieldTypes(newFieldTypes);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (value.trim() === '') {
            setErrors(prev => ({
                ...prev,
                [name]: 'Este campo es requerido'
            }));
        } else {
            const newErrors = { ...errors };
            delete newErrors[name];
            setErrors(newErrors);
        }
    };

    const generateTXTFile = () => {
        let fileContent = '';
        fields.forEach((field, index) => {
            const formattedFieldName = field.replace(/_/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            const fieldValue = formData[field] || 'Sin información';

            fileContent += `Cláusula ${index + 1} - ${formattedFieldName}:
${fieldValue}
${'_'.repeat(70)}
`;
        });
        return new Blob([fileContent], { type: 'text/plain' });
    };

    const generatePDFFile = () => {
        const doc = new jsPDF();
        
        // Configuración inicial
        doc.setFont('helvetica');
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text('ESCRITURA PÚBLICA', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Número: ${formData.numero_escritura || 'Sin número'}`, 105, 30, { align: 'center' });
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 45, 190, 45);
        
        // USO CORRECTO DE AUTOTABLE
        autoTable(doc, {
            startY: 60,
            head: [['Campo', 'Valor']],
            body: [
                ['Proceso', formData.proceso_escritura || 'No especificado'],
                ['Notaría', formData.nombre_notaria || 'No especificado'],
                ['Fecha de Otorgamiento', formData.fecha_otorgamiento || 'No especificada'],
                ['Municipio', formData.municipio || 'No especificado'],
                ['Dirección del Predio', formData.direccion_predio || 'No especificada'],
                ['Cédula Catastral', formData.cedula_catastral || 'No especificada'],
                ['Beneficiario', formData.beneficiario_id || 'No especificado']
            ],
            theme: 'grid',
            headStyles: { 
                fillColor: [70, 130, 180],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            styles: { 
                fontSize: 10,
                cellPadding: 4,
                halign: 'left'
            },
            columnStyles: {
                0: { cellWidth: 60 },
                1: { cellWidth: 'auto' }
            }
        });
    
        // Resto del documento...
        let y = doc.lastAutoTable.finalY + 15;
        
        if (fields.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(70, 130, 180);
            doc.text('CLÁUSULAS ADICIONALES', 20, y);
            y += 10;
            
            fields.forEach((field, index) => {
                const fieldName = field.replace(/_/g, ' ')
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                
                const fieldValue = formData[field] || 'Sin especificar';
                
                doc.setFontSize(12);
                doc.setTextColor(40, 40, 40);
                doc.text(`Cláusula ${index + 1}: ${fieldName}`, 20, y);
                y += 8;
                
                const lines = doc.splitTextToSize(fieldValue, 170);
                doc.setFontSize(11);
                doc.text(lines, 25, y);
                y += (lines.length * 7) + 10;
                
                if (index < fields.length - 1) {
                    doc.setDrawColor(220, 220, 220);
                    doc.line(20, y - 5, 190, y - 5);
                    y += 10;
                }
            });
        }
        
        // Descripción del movimiento
        y = Math.max(y, doc.lastAutoTable.finalY + 15);
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text('DESCRIPCIÓN DEL MOVIMIENTO:', 20, y);
        y += 8;
        
        const descLines = doc.splitTextToSize(formData.descripcion_movimiento || 'No hay descripción', 170);
        doc.setFontSize(11);
        doc.text(descLines, 20, y);
        
        // Pie de página
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Documento generado automáticamente - ' + new Date().toLocaleDateString(), 105, pageHeight - 10, { align: 'center' });
        
        return doc.output('blob');
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación de campos requeridos
        const requiredFields = [
            'numero_escritura',
            'proceso_escritura',
            'nombre_notaria',
            'fecha_otorgamiento',
            'fecha_inicio',
            'municipio',
            'beneficiario_id'
        ];

        const newErrors = {};
        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                newErrors[field] = 'Este campo es requerido';
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        try {
            // Generar ambos archivos
            const txtBlob = generateTXTFile();
            const pdfBlob = generatePDFFile();

            // Crear FormData para enviar al backend
            const formDataToSend = new FormData();

            // Agregar campos del formulario
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Agregar archivos
            formDataToSend.append('archivo_txt', txtBlob, `escritura_${formData.numero_escritura || 'nuevo'}.txt`);
            formDataToSend.append('archivo_pdf', pdfBlob, `escritura_${formData.numero_escritura || 'nuevo'}.pdf`);

            // Enviar al backend
            const response = await axios.post('http://localhost:8000/api/escrituras/', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            alert('Escritura creada correctamente');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error al crear proceso:', error);
            alert('Hubo un error al crear el proceso');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-800 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center">
                        <FileText className="mr-2" />
                        Crear Escritura 
                    </h2>
                    <button
                        onClick={() => setShowAddFieldModal(true)}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition"
                    >
                        <Plus size={24} className="text-white" />
                    </button>
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
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
                                    ${errors.numero_escritura ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'}`}
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
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
                                    ${errors.proceso_escritura ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'}`}
                            >
                                <option value="">Seleccione un proceso</option>
                                {isLoading ? (
                                    <option disabled>Cargando procesos...</option>
                                ) : (
                                    procesosList.map(proceso => (
                                        <option key={proceso.proceso_id} value={proceso.proceso_id}>
                                            {proceso.seriado_proceso} - {proceso.estado}
                                        </option>
                                    ))
                                )}
                            </select>
                            {errors.proceso_escritura && (
                                <p className="text-red-500 text-sm mt-1">{errors.proceso_escritura}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-2">Notaría</label>
                            <input
                                type="text"
                                name="nombre_notaria"
                                value={formData.nombre_notaria}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 
                  ${errors.nombre_notaria ? 'border-red-500 focus:ring-red-300' : 'focus:ring-blue-500'}`}
                                placeholder="Nombre de la notaría"
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
                  ${errors.fecha_otorgamiento ? 'border-red-500 focus:ring-red-300' : 'focus:ring-blue-500'}`}
                            />
                            {errors.fecha_otorgamiento && (
                                <p className="text-red-500 text-sm mt-1">{errors.fecha_otorgamiento}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-2">Fecha de Inicio</label>
                            <input
                                type="date"
                                name="fecha_inicio"
                                value={formData.fecha_inicio}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 
                  ${errors.fecha_inicio ? 'border-red-500 focus:ring-red-300' : 'focus:ring-blue-500'}`}
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
                  ${errors.municipio ? 'border-red-500 focus:ring-red-300' : 'focus:ring-blue-500'}`}
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
                  ${errors.beneficiario_id ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'}`}
                                placeholder="Número de identificación"
                            />
                            {errors.beneficiario_id && (
                                <p className="text-red-500 text-sm mt-1">{errors.beneficiario_id}</p>
                            )}
                        </div>

                        {fields.map((field) => (
                            <div key={field} className="relative">
                                <label className="block text-gray-700 mb-2 flex items-center justify-between">
                                    <span className="capitalize">{field.replace(/_/g, ' ')}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeField(field)}
                                        className="text-red-500 hover:bg-red-50 p-1 rounded-full transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </label>
                                <input
                                    type={fieldTypes[field] || 'text'}
                                    name={field}
                                    value={formData[field] || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`Ingrese ${field.replace(/_/g, ' ')}`}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-xl transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            <span className="flex items-center">
                                <Save className="mr-2" size={16} />
                                Guardar
                            </span>
                        </button>
                    </div>
                </form>

                {showAddFieldModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Agregar Campo Personalizado</h3>
                                <button 
                                    onClick={() => setShowAddFieldModal(false)} 
                                    className="p-1 rounded-full hover:bg-gray-100 transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 mb-2">Nombre del Campo</label>
                                    <input
                                        type="text"
                                        value={newFieldName}
                                        onChange={(e) => setNewFieldName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej: Propietario, Testigo, etc."
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">Tipo de Campo</label>
                                    <select
                                        value={newFieldType}
                                        onChange={(e) => setNewFieldType(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="text">Texto</option>
                                        <option value="number">Número</option>
                                        <option value="date">Fecha</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-4 pt-4">
                                    <button 
                                        onClick={() => setShowAddFieldModal(false)} 
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={addField}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Agregar Campo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WriteProcessForm;
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, FileText, Download, Save, Loader, X, Edit3, Plus, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { jsPDF } from 'jspdf';

const ModalTxt = () => {
  const { escrituraId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const direccionURL = location.state?.url; // URL de Cloudinary
  
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Tipos de campos disponibles
  const fieldTypes = [
    { value: 'clausula', label: 'Cláusula' },
    { value: 'componente', label: 'Componente' },
    { value: 'seccion', label: 'Sección' },
    { value: 'otro', label: 'Otro' }
  ];

  // Función para generar el PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Configuración inicial
    let yPosition = 20;
    const lineHeight = 7;
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Estilo para el título
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('DOCUMENTO LEGAL', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Estilo para el contenido
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    fields.forEach((field, index) => {
      // Agregar título del campo
      doc.setFont('helvetica', 'bold');
      const title = `${field.name} ${field.number}:`;
      doc.text(title, margin, yPosition);
      yPosition += lineHeight;
      
      // Agregar contenido del campo
      doc.setFont('helvetica', 'normal');
      
      // Dividir el contenido en líneas que caben en el ancho de la página
      const contentLines = doc.splitTextToSize(field.content, pageWidth - 2 * margin);
      doc.text(contentLines, margin, yPosition);
      yPosition += (contentLines.length * lineHeight) + 10;
      
      // Agregar separador si no es el último campo
      if (index < fields.length - 1) {
        doc.setDrawColor(200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 15;
      }
      
      // Verificar si necesitamos una nueva página
      if (yPosition > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPosition = 20;
      }
    });
    
    return doc;
  };

  useEffect(() => {
    const fetchTextFile = async () => {
      if (!direccionURL) {
        setError('URL del archivo no proporcionada');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(direccionURL);
        const textContent = await response.text();
        
        // Parsear el contenido del archivo de texto
        const fieldsSeparator = '______________________________________________________________________';
        const fieldParts = textContent.split(fieldsSeparator).filter(part => part.trim() !== '');
        
        const parsedFields = fieldParts.map((part, index) => {
          const trimmedPart = part.trim();
          const titleMatch = trimmedPart.match(/^(ClÃ¡usula \d+ - ([^:]+)):/i);
          
          if (titleMatch) {
            const fullTitle = titleMatch[1];
            const typeName = titleMatch[2].trim();
            
            const titleEndIndex = trimmedPart.indexOf("\n", titleMatch[0].length);
            let content = "";
            
            if (titleEndIndex !== -1) {
              content = trimmedPart.substring(titleEndIndex).trim();
            } else {
              content = "";
            }
            
            let type = 'otro';
            let number = index + 1;
            let name = typeName;
            
            if (typeName.toLowerCase().includes('componente')) {
              type = 'componente';
              const numMatch = fullTitle.match(/ClÃ¡usula (\d+)/i);
              if (numMatch) number = parseInt(numMatch[1]);
            } else if (typeName.toLowerCase().includes('clausula')) {
              type = 'clausula';
              const numMatch = fullTitle.match(/ClÃ¡usula (\d+)/i);
              if (numMatch) number = parseInt(numMatch[1]);
            } else if (typeName.toLowerCase().includes('seccion')) {
              type = 'seccion';
              const numMatch = fullTitle.match(/ClÃ¡usula (\d+)/i);
              if (numMatch) number = parseInt(numMatch[1]);
            }
            
            return { 
              id: `field-${index}`, 
              type, 
              number,
              name,
              content 
            };
          } else {
            return { 
              id: `field-${index}`, 
              type: 'otro',
              number: index + 1,
              name: `Otro ${index + 1}`,
              content: trimmedPart 
            };
          }
        });
        
        setFields(parsedFields);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar el archivo:', err);
        setError('Error al cargar el archivo. Por favor intenta de nuevo.');
        setLoading(false);
      }
    };

    fetchTextFile();
  }, [direccionURL]);

  const handleContentChange = (id, newContent) => {
    setFields(prevFields => 
      prevFields.map(field => 
        field.id === id ? { ...field, content: newContent } : field
      )
    );
  };

  const handleTypeChange = (id, newType) => {
    setFields(prevFields => 
      prevFields.map(field => 
        field.id === id ? { ...field, type: newType } : field
      )
    );
  };

  const handleNumberChange = (id, newNumber) => {
    const parsedNumber = parseInt(newNumber) || 1;
    setFields(prevFields => 
      prevFields.map(field => 
        field.id === id ? { ...field, number: parsedNumber } : field
      )
    );
  };

  const handleNameChange = (id, newName) => {
    setFields(prevFields => 
      prevFields.map(field => 
        field.id === id ? { ...field, name: newName } : field
      )
    );
  };

  const addNewField = (insertAfterIndex) => {
    const newField = {
      id: `field-${Date.now()}`,
      type: 'clausula',
      number: fields.length + 1,
      name: 'Clausula',
      content: ''
    };

    const newFields = [...fields];
    newFields.splice(insertAfterIndex + 1, 0, newField);
    setFields(newFields);
  };

  const removeField = (id) => {
    setFields(prevFields => prevFields.filter(field => field.id !== id));
  };

  const moveField = (id, direction) => {
    const currentIndex = fields.findIndex(field => field.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === fields.length - 1)
    ) {
      return;
    }

    const newFields = [...fields];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    [newFields[currentIndex], newFields[targetIndex]] = [newFields[targetIndex], newFields[currentIndex]];
    
    setFields(newFields);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      // Crear el contenido del texto formateado
      const formattedContent = fields.map(field => {
        const typeLabel = `Cláusula ${field.number} - ${field.name}`;
        return `${typeLabel}:\n${field.content}`;
      }).join('\n______________________________________________________________________\n');

      // Crear archivo .txt desde el contenido
      const blobTxt = new Blob([formattedContent], { type: 'text/plain' });
      const fileTxt = new File([blobTxt], `escritura_${escrituraId}.txt`, { type: 'text/plain' });

      // Generar PDF
      const pdfDoc = generatePDF();
      const pdfBlob = pdfDoc.output('blob');
      const filePdf = new File([pdfBlob], `escritura_${escrituraId}.pdf`, { type: 'application/pdf' });

      console.log("agregando un console log");

      console.log("agregar otro console log");
      const formData = new FormData();
      formData.append("archivo_txt", fileTxt);
      formData.append("archivo_pdf", filePdf);
      formData.append("numero_escritura", escrituraId);
      formData.append("user_id", sessionStorage.getItem("cedula"));

      console.log(sessionStorage);
      

      await axios.put(`http://127.0.0.1:8000/api/escrituras/${escrituraId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSaveSuccess(true);
      setSaving(false);
    } catch (err) {
      setError('Error al guardar los cambios. Por favor intenta de nuevo.');
      setSaving(false);
    }
  };

  const downloadAsText = () => {
    const formattedContent = fields.map(field => {
      const typeLabel = `Cláusula ${field.number} - ${field.name}`;
      return `${typeLabel}:\n${field.content}`;
    }).join('\n______________________________________________________________________\n');

    const blob = new Blob([formattedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documento_${escrituraId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsPDF = () => {
    const pdfDoc = generatePDF();
    pdfDoc.save(`documento_${escrituraId}.pdf`);
  };

  const getFieldTitle = (field) => {
    return `${field.name} ${field.number}`;
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col relative animate-fadeIn overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={goBack}
              className="flex items-center text-blue-900 hover:text-blue-700 transition-colors mr-4"
              aria-label="Volver"
            >
              <ArrowLeft size={18} className="mr-1" />
              <span className="text-sm font-medium">Volver</span>
            </button>
            <h2 className="text-xl font-bold text-blue-900 flex items-center">
              <FileText size={20} className="mr-2" />
              Editor de Campos
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-md">
                ID: {escrituraId}
              </span>
            </h2>
          </div>
          
          <button 
            onClick={goBack}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader size={40} className="text-blue-900 animate-spin mb-4" />
              <p className="text-gray-600">Cargando documento...</p>
            </div>
          </div>
        ) : error && fields.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="bg-red-100 text-red-500 p-4 rounded-md mb-4 inline-flex">
                <span className="text-3xl">!</span>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Error al cargar el documento</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={goBack}
                className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors"
              >
                Volver al panel
              </button>
            </div>
          </div>
        ) : saveSuccess ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Save size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">¡Cambios guardados con éxito!</h3>
              <p className="text-gray-600 mb-6">El documento ha sido actualizado correctamente.</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setSaveSuccess(false)}
                  className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors"
                >
                  Continuar editando
                </button>
                <button
                  onClick={goBack}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Volver al panel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => addNewField(-1)}
                  className="px-3 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors flex items-center shadow-sm text-sm"
                >
                  <Plus size={16} className="mr-1" />
                  Agregar campo al inicio
                </button>
              </div>
              
              {fields.map((field, index) => (
                <div 
                  key={field.id} 
                  className="mb-6 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors group relative"
                >
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <button
                      onClick={() => moveField(field.id, 'up')}
                      disabled={index === 0}
                      className={`p-1 rounded hover:bg-gray-100 ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500'}`}
                      title="Mover arriba"
                    >
                      <MoveUp size={16} />
                    </button>
                    <button
                      onClick={() => moveField(field.id, 'down')}
                      disabled={index === fields.length - 1}
                      className={`p-1 rounded hover:bg-gray-100 ${index === fields.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500'}`}
                      title="Mover abajo"
                    >
                      <MoveDown size={16} />
                    </button>
                    <button
                      onClick={() => removeField(field.id)}
                      className="p-1 rounded hover:bg-red-100 text-red-500"
                      title="Eliminar campo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center mb-3 space-x-3">
                    <div className="w-1/4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                      <select
                        value={field.type}
                        onChange={(e) => handleTypeChange(field.id, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                      >
                        {fieldTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-1/6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                      <input
                        type="number"
                        min="1"
                        value={field.number}
                        onChange={(e) => handleNumberChange(field.id, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                      />
                    </div>
                    <div className="w-1/3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => handleNameChange(field.id, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                        placeholder="Nombre del campo"
                      />
                    </div>
                    <div className="w-1/4 pt-6">
                      <h3 className="text-lg font-medium text-blue-900">{getFieldTitle(field)}</h3>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                    <textarea
                      value={field.content}
                      onChange={(e) => handleContentChange(field.id, e.target.value)}
                      className="w-full min-h-[100px] p-3 border border-gray-200 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                      placeholder="Ingrese el contenido aquí..."
                    />
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => addNewField(index)}
                      className="px-3 py-1 bg-blue-50 text-blue-800 rounded-md hover:bg-blue-100 transition-colors flex items-center text-sm"
                    >
                      <Plus size={14} className="mr-1" />
                      Agregar campo después
                    </button>
                  </div>
                </div>
              ))}

              {fields.length === 0 && !loading && (
                <div className="text-center p-10 border-2 border-dashed border-gray-300 rounded-lg">
                  <FileText size={40} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-4">No hay campos en este documento.</p>
                  <button
                    onClick={() => addNewField(-1)}
                    className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors"
                  >
                    Agregar primer campo
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              {error && (
                <div className="bg-red-50 text-red-500 p-2 px-3 rounded-md text-sm flex items-center mr-4">
                  <span className="inline-block w-4 h-4 min-w-4 bg-red-100 rounded-full text-center text-red-500 mr-2">!</span>
                  {error}
                </div>
              )}
              <div className="flex-1"></div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={downloadAsText}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Download size={16} className="mr-2" />
                  Descargar .txt
                </button>
                <button
                  onClick={downloadAsPDF}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Download size={16} className="mr-2" />
                  Descargar .pdf
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors flex items-center shadow-sm"
                >
                  {saving ? (
                    <>
                      <Loader size={16} className="animate-spin mr-2" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      <span>Guardar cambios</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModalTxt;
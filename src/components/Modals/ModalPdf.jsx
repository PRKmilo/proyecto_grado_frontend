import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, X, FileText, Check, Loader, ArrowLeft } from 'lucide-react';

const ModalPdf = () => {
    const { escrituraId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const direccionURL = location.state?.url;

    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setFileName(selectedFile.name);
            setError('');
        } else {
            setFile(null);
            setFileName('');
            setError('Por favor selecciona un archivo PDF válido');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Por favor selecciona un archivo primero');
            return;
        }

        const formData = new FormData();
        const cedula = sessionStorage.getItem("cedula");
        formData.append('pdf', file);
        formData.append('escrituraId', escrituraId);

        setUploading(true);
        setError('');

        try {
            await axios.put('http://localhost:8000/api/escrituras/pdf_actualizacion/'+escrituraId+"/", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUploadSuccess(true);
            setUploading(false);
        } catch (err) {
            setError('Error al subir el archivo. Por favor intenta de nuevo.');
            setUploading(false);
        }
    };

    const closeModal = () => {
        // Implementa la lógica para cerrar el modal
        console.log('Cerrar modal');
    };

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative animate-fadeIn">
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Cerrar"
                >
                    <X size={20} />
                </button>

                <button
                    onClick={goBack}
                    className="absolute top-4 left-4 flex items-center text-blue-900 hover:text-blue-700 transition-colors"
                    aria-label="Volver"
                >
                    <ArrowLeft size={18} className="mr-1" />
                    <span className="text-sm font-medium">Volver</span>
                </button>

                <div className="text-center mt-6 mb-8">
                    <h2 className="text-2xl font-bold text-blue-900">Corregir PDF</h2>
                    <p className="text-sm text-gray-600 mt-1">Documento ID: {escrituraId}</p>
                </div>

                {uploadSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <Check size={40} className="text-green-500" />
                        </div>
                        <p className="text-xl font-medium text-gray-800 mb-2">¡Archivo subido con éxito!</p>
                        <p className="text-gray-600 mb-6 text-center">El documento ha sido enviado correctamente</p>

                        <button
                            onClick={goBack}
                            className="px-6 py-3 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors flex items-center"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Volver al panel
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 mb-6 bg-blue-50 hover:bg-blue-100 transition-colors group">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="w-16 h-16 bg-blue-900 bg-opacity-10 rounded-full flex items-center justify-center group-hover:bg-opacity-20 transition-colors">
                                    <FileText size={36} className="text-blue-900" />
                                </div>

                                <div className="text-center">
                                    {file ? (
                                        <div>
                                            <p className="text-md font-medium text-gray-800">{fileName}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-600">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                                    )}
                                </div>

                                <label className="flex items-center justify-center px-5 py-2.5 bg-white border border-blue-900 text-blue-900 rounded-md cursor-pointer hover:bg-blue-50 transition-colors font-medium">
                                    <Upload size={16} className="mr-2" />
                                    <span>{file ? "Cambiar archivo" : "Seleccionar PDF"}</span>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-500 p-4 rounded-md mb-5 text-sm flex items-start">
                                <span className="inline-block w-5 h-5 min-w-5 bg-red-100 rounded-full text-center text-red-500 mr-2 mt-0.5">!</span>
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col space-y-3">
                            <button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className={`w-full py-3 px-4 rounded-md flex items-center justify-center text-white font-medium
                  ${!file ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-900 hover:bg-blue-800 transition-colors shadow-md'}`}
                            >
                                {uploading ? (
                                    <>
                                        <Loader size={18} className="animate-spin mr-2" />
                                        <span>Subiendo documento...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} className="mr-2" />
                                        <span>Subir corrección</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={goBack}
                                className="w-full py-3 px-4 rounded-md flex items-center justify-center text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft size={18} className="mr-2" />
                                <span>Cancelar</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ModalPdf;
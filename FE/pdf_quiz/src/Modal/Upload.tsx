import React, { useRef, useState } from 'react';
import pdfLogo from '../assets/pdf_logo.png';
import closeIcon from '../assets/X.png'; 

interface ModalProps {
    showModal: boolean;
    closeModal: () => void;
    width?: string;
    height?: string;
    boxSize?: string;
}

export default function Upload({ showModal, closeModal, width = '700px', height = '440px', boxSize = '350px' }: ModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);
    const [errors, setErrors] = useState<string | null>(null);

    const apiBaseUrl = 'https://2afa-218-238-83-155.ngrok-free.app/api/v1/files/upload/pdf';

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const fileURL = URL.createObjectURL(file);
            setPreview(fileURL);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setErrors('Please select a PDF file to upload.');
            console.log('No file selected for upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(apiBaseUrl, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                setUploadMessage(result.message);
                setErrors(null);
                console.log('Upload successful:', result);
            } else if (response.status === 400) {
                const result = await response.json();
                setUploadMessage(result.message);
                setErrors('Upload failed: Invalid file format.');
                console.log('Upload failed with 400 Bad Request:', result);
            } else {
                const result = await response.json();
                setUploadMessage(result.message);
                setErrors('Upload failed: Server error.');
                console.log('Upload failed with status:', response.status, result);
            }
        } catch (error) {
            setUploadMessage('An error occurred while uploading the file.');
            setErrors('Network error occurred.');
            console.error('Upload error:', error);
        }
    };

    if (!showModal) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg" style={{ width, height }}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold mb-2">PDF Upload</h2>
                    <img src={closeIcon} alt="Close" onClick={closeModal} className="cursor-pointer" style={{ width: '16px', height: '16px', marginTop: '-8px' }} />
                </div>            
                <div className="flex flex-row items-center space-x-4">
                    <div className="bg-white rounded-lg flex flex-col items-center justify-center" style={{ width: boxSize, height: boxSize, border: '2px dashed', borderColor: '#2563EB' }}>
                        <img src={pdfLogo} alt="PDF Logo" style={{ maxWidth: '50%', maxHeight: '50%', opacity: 0.5 }} />
                        <button style={{ 
                                marginTop: '10px', 
                                textAlign: 'center',
                                backgroundColor: 'transparent',
                                color: '#2563EB',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                            }} onClick={handleButtonClick}>Drag and Drop your PDF file!</button>
                        <input 
                            type="file" 
                            accept=".pdf" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            onChange={handleFileChange} 
                        />
                        {selectedFile && (
                            <span style={{ marginTop: '10px', textAlign: 'center' }}>
                                {selectedFile.name}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col space-y-4" style={{ marginLeft: '40px' }}>
                        {/* 시험 문제 수 / 선지 수 선택 */}
                        <div className="flex items-center">
                            <span className="mr-2 font-bold">시험문제</span>
                            <select className="p-2 border border-gray-300 rounded">
                                <option value="">3</option>
                                <option value="">5</option>
                                <option value="">10</option>
                                <option value="">20</option>
                                <option value="">30</option>
                            </select>
                            <span className="ml-2 mr-2">선지</span>
                            <select className="p-2 border border-gray-300 rounded">
                                <option value="">3</option>
                                <option value="">4</option>
                                <option value="">5</option>
                                <option value="">6</option>
                                <option value="">7</option>
                                <option value="">8</option>
                                <option value="">9</option>
                                <option value="">10</option>
                            </select>
                        </div>
                        {/* 제한 시간 선택 */}
                        <div className="flex items-center">
                            <span className="mr-2 font-bold">제한시간</span>
                            <select className="p-2 border border-gray-300 rounded">
                                <option value="">0</option>
                                <option value="">1</option>
                                <option value="">2</option>
                                <option value="">3</option>
                                <option value="">4</option>
                                <option value="">5</option>
                                <option value="">6</option>
                                <option value="">7</option>
                                <option value="">8</option>
                                <option value="">9</option>
                                <option value="">10</option>
                            </select>
                            <span className="ml-2 mr-2">시간</span>
                            <select className="p-2 border border-gray-300 rounded">
                                    <option value="">0</option>
                                    <option value="">5</option>
                                    <option value="">10</option>
                                    <option value="">15</option>
                                    <option value="">30</option>
                                    <option value="">45</option>
                                </select>
                                <span className="ml-2 mr-2">분</span>
                        </div>
                        {/* 완료 버튼 */}
                        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleUpload}>
                            Upload
                        </button>
                    </div>
                </div>
                {uploadMessage && (
                    <div className="mt-4 text-center">
                        <p>{uploadMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
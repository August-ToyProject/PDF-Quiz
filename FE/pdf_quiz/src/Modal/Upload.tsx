import React, { useRef, useState } from 'react';
import pdfLogo from '../assets/DragFile.png';
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
    //드래그 active 여부
    const [isActive, setIsActive] = useState(false);
    //PDF 파일 선택 후 버튼 클릭시 선택지 활성화
    const [isSelectDisabled, setIsSelectDisabled] = useState(true);
    //PDF 파일 선택
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);
    const [errors, setErrors] = useState<string | null>(null);

    const [difficulty, setDifficulty] = useState<string>('쉬움');
    const [quiz_cnt, setQuiz_cnt] = useState<string>('5');
    const [option_cnt, setOption_cnt] = useState<string>('4');
    const [timeLimitHour, setTimeLimitHour] = useState<string>('0');
    const [timeLimitMinute, setTimeLimitMinute] = useState<string>('0');

    const apiBaseUrl = 'https://2afa-218-238-83-155.ngrok-free.app/api/v1/files/upload/pdf';

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation();
        setIsActive(true);
    }
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation();
        setIsActive(false);
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation();

        if(e.dataTransfer!.files){
            setIsActive(true)
        }
    
    }
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation();
        setIsActive(false)

        if(e.dataTransfer!.files){
            const file = e.dataTransfer!.files[0]
            if (file) {
                setSelectedFile(file);
                const fileURL = URL.createObjectURL(file);
                setPreview(fileURL);
            }
        }
    }

    const formData = new FormData();

    //Drag and Drop 버튼 클릭시 파일 선택
    const handleFileSelectClick = () => {
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
    //PDF 파일 선택 후 버튼 클릭시 선택지 활성화
    const handlePDFUploadClick = async () => {
        if (selectedFile) {
            setIsSelectDisabled(false);
            formData.append('file', selectedFile);
        } else {
            setErrors('Please select a file first.');
        }

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
    }

    const handleGenerateClick = async () => {
        if (!selectedFile) {
            setErrors('Please select a PDF file to upload.');
            console.log('No file selected for upload.');
            return;
        }

        // 난이도 매핑
        let difficultyValue;
        if (difficulty === '쉬움') {
            difficultyValue = 1;
        } else if (difficulty === '보통') {
            difficultyValue = 2;
        } else if (difficulty === '어려움') {
            difficultyValue = 3;
        }

        const time = new Date();
        time.setHours(parseInt(timeLimitHour, 10));
        time.setMinutes(parseInt(timeLimitMinute, 10));
        const created_at = time.toISOString();

        formData.append('difficulty', String(difficultyValue));
        formData.append('quiz_cnt', quiz_cnt);
        formData.append('option_cnt', option_cnt);
        formData.append('created_at', created_at);

        try {
            //Todo: Url 변경 예정
            const response = await fetch(apiBaseUrl, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                setUploadMessage(result.message);
                setErrors(null);
                console.log('Generation successful:', result);
            } else if (response.status === 400) {
                const result = await response.json();
                setUploadMessage(result.message);
                setErrors('Request failed: Invalid data provided.');
                console.log('Request failed with 400 Bad Request:', result);
            } else {
                const result = await response.json();
                setUploadMessage(result.message);
                setErrors('Request failed: Server error.');
                console.log('Request failed with status:', response.status, result);
            }
        } catch (error) {
            setUploadMessage('An error occurred while processing the request.');
            setErrors('Network error occurred.');
            console.error('Generation error:', error);
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
                    <div className={`rounded-lg flex flex-col items-center justify-center border-2 border-blue-600
                    ${isActive ? 'bg-slate-200 border-3 border-dashed'  : 'bg-white border-solid' }`}
                         style={{ width: boxSize, height: boxSize, }}
                         onDragStart={handleDragStart}
                         onDragLeave={handleDragEnd}
                         onDragOver={handleDragOver}
                         onDrop={handleDrop}>
                        <img src={pdfLogo} alt="PDF Logo" style={{ maxWidth: '30%', maxHeight: '30%', opacity: 0.7 }} />
                        <div className='text-blue-600 font-semibold'>Drag and Drop</div>
                        <div className='text-xs text-blue-600 font-semibold'>Or</div>
                        <button className='mt-1 mb-1 text-sm text-blue-600 font-semibold cursor-pointer border-1 border-gray-400'
                        style={{ 
                                textAlign: 'center',
                                backgroundColor: 'transparent',
                            }} onClick={handleFileSelectClick}>Select your PDF file!</button>
                        <input 
                            type="file" 
                            accept=".pdf" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            onChange={handleFileChange} 
                        />
                        {selectedFile && (
                            <span className = 'mt-7 mb-3 text-sm font-semibold items-center'>
                                {selectedFile.name}
                            </span>
                        )}
                        <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded" onClick={handlePDFUploadClick}>PDF 업로드</button>

                    </div>
                    
                    <div className="flex flex-col space-y-4" style={{ marginLeft: '40px' }}>
                        <div className="flex flex-col items-start mb-2">
                            <div>* PDF 파일 업로드 후 버튼을 클릭하셔야</div>
                            <div>선택 칸이 활성화됩니다!</div>

                        </div>
                        {/* 난이도 */}
                        <div className="flex items-center">
                            <span className="mr-2 font-bold">난이도</span>
                            <select className="p-2 border border-gray-300 rounded ml-4 " 
                            value={difficulty} 
                            onChange={(e) => setDifficulty(e.target.value)}
                            disabled={isSelectDisabled}>
                                <option value="">쉬움</option>
                                <option value="">보통</option>
                                <option value="">어려움</option>
                            </select>
                        </div>
                        {/* 시험 문제 수 / 선지 수 선택 */}
                        <div className="flex items-center">
                            <span className="mr-2 font-bold">시험 문제</span>
                            <select className="p-2 border border-gray-300 rounded" 
                            value={quiz_cnt} 
                            onChange={(e) => setQuiz_cnt(e.target.value)}
                            disabled={isSelectDisabled}>
                            
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="15">15</option>
                                <option value="20">20</option>
                                <option value="25">25</option>
                                <option value="30">30</option>
                                <option value="35">35</option>
                                <option value="40">40</option>
                                <option value="45">45</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                        <div>
                            <span className="mr-2 font-bold">선지 개수</span>
                                <select className="p-2 border border-gray-300 rounded" 
                                value={option_cnt} 
                                onChange={(e) => setOption_cnt(e.target.value)}
                                disabled={isSelectDisabled}>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </select>
                        </div>
                        {/* 제한 시간 선택 */}
                        <div className="flex items-center">
                            <span className="mr-2 font-bold">제한 시간</span>
                            <select className="p-2 border border-gray-300 rounded" 
                            value={timeLimitHour} 
                            onChange={(e) => setTimeLimitHour(e.target.value)}
                            disabled={isSelectDisabled}>
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                                <option value="9">9</option>
                                <option value="10">10</option>
                            </select>
                            <span className="ml-2 mr-2">시간</span>
                            <select className="p-2 border border-gray-300 rounded" 
                            value={timeLimitMinute} 
                            onChange={(e) => setTimeLimitMinute(e.target.value)}
                            disabled={isSelectDisabled}>
                                    <option value="0">0</option>
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="15">15</option>
                                    <option value="20">20</option>
                                    <option value="25">25</option>
                                    <option value="30">30</option>
                                    <option value="35">35</option>
                                    <option value="40">40</option>
                                    <option value="45">45</option>
                                    <option value="50">50</option>
                                    <option value="55">55</option>
                                </select>
                                <span className="ml-2 mr-2">분</span>
                        </div>
                        {/* 완료 버튼 */}
                        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleGenerateClick}>
                            문제 생성하기
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
}
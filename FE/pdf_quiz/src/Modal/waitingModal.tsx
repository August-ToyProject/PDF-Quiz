import React, { useState, useEffect } from 'react';
import modalImage1 from '../assets/modalImage1.png'
import modalImage2 from '../assets/modalImage2.png'

interface ImageModalProps {
  showModal: boolean;   // 모달이 열려있는지 여부
  closeModal: () => void;  // 모달을 닫는 함수
}

const WaitingModal: React.FC<ImageModalProps> = ({ showModal, closeModal }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = [modalImage1, modalImage2]; 
    const texts = [
        "1. 문제를 읽고 제한 시간 내에 풀어주세요!",
        "2. OMR을 체크해주세요!"
    ];

    useEffect(() => {
        if (!showModal) {
        setCurrentImageIndex(0);  // 모달이 닫힐 때 1페이지로 초기화
        }
    }, [showModal]);

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md">
                <div className="rounded-t-2xl items-center mb-4 h-32 bg-blue-500">
                    <div className='w-full flex justify-end'>
                        <button
                            className="flex justify-end text-white focus:outline-none bg-transparent"
                            onClick={closeModal}
                        >
                            &times;
                        </button>
                    </div>
                    <div className='w-full flex justify-center'>
                        <div className="text-xl font-semibold text-white p-4">
                            {texts[currentImageIndex]}
                        </div>
                    </div>
                </div>
                <div className="mb-4">
                    <img
                        src={images[currentImageIndex]}
                        alt="사용 방법 이미지"
                        className=" object-cover rounded"
                    />
                </div>
                <div className="flex justify-between mx-8 my-4">
                    <p>
                        {currentImageIndex + 1} / {images.length}
                    </p>
                    {currentImageIndex === images.length - 1 ? (
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            onClick={closeModal}
                        >
                            닫기
                        </button>
                    ) : (
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            onClick={handleNextImage}
                        >
                            다음
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WaitingModal;

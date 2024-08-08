import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

export default function MyPage() {
    const [showModal, setShowModal] = useState(false);

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    return(
        <div className="h-screen w-full flex flex-col items-center bg-white">
            <div className="absolute top-0 left-0 w-full">
                <div className="text-blue-600 text-xl mt-4 mx-4 font-bold">
                    PDF Quiz
                </div>
                <div className="absolute left-0 right-0 h-[2px] bg-gray-300 mt-1 mx-4"></div>
            </div>
            <div className="absolute top-10 left-0 w-full h-full font-bold flex">    
                <div className="flex flex-col mt-6 mx-4">
                    <div className="text-blue-600 text-xs">
                        마이프로필
                    </div>
                    <div className="mt-2 p-4 border border-gray-300 rounded-lg max-w-[14rem] h-24">
                        <div className='text-center'>
                            닉네임
                        </div>
                        <div className="flex justify-center space-x-4 mt-4">
                            <button className="px-2 py-1 bg-gray-400 text-xs text-white rounded-full">개인 정보 수정</button>
                            <button className="px-2 py-1 bg-gray-400 text-xs text-white rounded-full">로그아웃</button>
                        </div>
                    </div>
                    <button className='bg-blue-600 mt-4 text-white font-bold' onClick={openModal}>
                        PDF Upload
                    </button>
                </div>
                <div className="mt-12 mx-4 p-4 border border-gray-300 rounded-lg w-[600px] h-[650px] bg-gray-100">
                    <div className="text-center h-full">
                        큰 사각 박스 내용
                    </div>
                </div>
            </div>
            <Modal showModal={showModal} closeModal={closeModal} />
        </div>
    )
}
import React, { useState } from 'react';
import folderImage from '../assets/folder2.png';

interface FolderCreationModalProps {
    isVisible: boolean;
    onClose: () => void;
    onCreate: (folderName: string) => void;
}

const CreateFolderModal: React.FC<FolderCreationModalProps> = ({ isVisible, onClose, onCreate }) => {
    const [folderName, setFolderName] = useState('');

    const handleCreate = () => {
        if (folderName.trim()) {
            onCreate(folderName);
            setFolderName('');
            onClose();
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
                <img src={folderImage} alt="폴더" className="w-24 h-24 mx-auto mb-4" />
                <input
                    type="text"
                    className="border border-gray-300 rounded-lg w-full py-2 px-3"
                    placeholder="폴더 이름을 입력하세요"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleCreate();
                        }
                    }}
                    autoFocus
                />
                <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg">취소</button>
                    <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg">생성</button>
                </div>
            </div>
        </div>
    );
};

export default CreateFolderModal;

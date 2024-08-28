import React, {useState} from 'react';


interface FolderModalProps {
    folders: { id: number; name: string }[];
    onClose: () => void;
    onConfirm: (folderId: number | null) => void;
}

const FolderModal: React.FC<FolderModalProps> = ({ folders, onClose, onConfirm }) => {
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

    const handleConfirm = () => {
        onConfirm(selectedFolderId);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                <h2 className="text-lg font-bold mb-4">폴더 선택</h2>
                <ul className="space-y-2">
                    {folders.map(folder => (
                        <li key={folder.id}>
                            <label className="flex items-center space-x-2">
                                <input 
                                    type="radio" 
                                    className="form-checkbox" 
                                    name='folder'
                                    value={folder.id}
                                    onChange={() => setSelectedFolderId(folder.id)}
                                />
                                <span>{folder.name}</span>
                            </label>
                        </li>
                    ))}
                </ul>
                <div className="mt-6 flex justify-end space-x-2">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                    >
                        취소
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                        disabled={selectedFolderId === null}
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FolderModal;

import React from 'react';

interface ModalProps {
    showModal: boolean;
    closeModal: () => void;
}

const Modal: React.FC<ModalProps> = ({ showModal, closeModal }) => {
    if (!showModal) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg max-w-md w-full flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4">Title</h2>
                <p className="mb-4 text-center">Description</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={closeModal}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default Modal;

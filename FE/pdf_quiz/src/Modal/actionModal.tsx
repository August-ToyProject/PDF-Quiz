import React, { useState } from "react";
import { Folder, ListQuiz } from "../pages/MyPage";
import { deleteFolder, updateFolderName } from "../api/ApiFolder";
import { deleteQuiz, moveQuizToFolder } from "../api/ApiQuiz";
// import start_yellow from "../assets/Star_yellow.png"
import start_gray from "../assets/Star_gray.png"

interface ActionModalProps {
    items: (Folder | ListQuiz)[];
    onClose: () => void;
    mode: "move" | "delete"| "edit";
    onDelete: (selectedItems: (Folder | ListQuiz)[]) => void;
    folders: Folder[];
    setQuiz: React.Dispatch<React.SetStateAction<ListQuiz[]>>;
    setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
}

const ActionModal: React.FC<ActionModalProps> = ({ items, onClose, mode, onDelete, folders, setQuiz, setFolders}) => {
    const [selectedItems, setSelectedItems] = useState<(Folder | ListQuiz)[]>([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [newName, setNewName] = useState<string>("");  

    const filteredItems = mode === "edit" ? items.filter((item) => "name" in item) : items;

    const toggleSelection = (item: Folder | ListQuiz) => {
        setSelectedItems((prevSelectedItems) => {
            if (prevSelectedItems.includes(item)) {
                return prevSelectedItems.filter((selected) => selected !== item);
            } else {
                return [...prevSelectedItems, item];
            }
        });
        if ("name" in item) {
            setNewName(item.name);
        }
    };
    const handleDeleteClick = () => {
        if (selectedItems.length > 0) {
            setShowConfirmModal(true);
        }
    };

    const handleDelete = async () => {
        try {
            for (const item of selectedItems) {
                if ("title" in item) {
                    await deleteQuiz(item.id);
                } else {
                    if (item.id >= 0) {
                        await deleteFolder(item.id);
                    }
                }
            }
            onDelete(selectedItems);
            onClose();
        } catch (error) {
            console.error("삭제 중 오류 발생:", error);
        } finally {
            setShowConfirmModal(false);
        }
    };

    const handleMoveToFolder = async () => {
        if (selectedItems.length > 0 && selectedFolderId !== null) {
            try {
                for (const item of selectedItems) {
                    if ("title" in item) {
                        await moveQuizToFolder(item.id, selectedFolderId);
                        setQuiz((prevQuiz) =>
                            prevQuiz.map((q) => (q.id === item.id ? { ...q, folderId: selectedFolderId } : q))
                        );
                    }
                }
                onClose();
            } catch (error) {
                console.error("퀴즈 이동 중 오류 발생:", error);
            }
        }
    };

    const handleEdit = async () => {
        if (selectedItems.length === 1 && "name" in selectedItems[0]) {
            const folder = selectedItems[0];
            try {
                await updateFolderName(folder.id, newName);
                setFolders((prevFolders) =>
                    prevFolders.map((f) => (f.id === folder.id ? { ...f, name: newName } : f))
                );
                onClose();
            } catch (error) {
                console.error("폴더 이름 수정 중 오류 발생:", error);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[80vw] h-auto border-2 border-blue-600">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg lg:mb-2">폴더 및 퀴즈 목록</h2>
                    <button className="text-red-500 font-bold text-lg bg-transparent" onClick={onClose}>
                        닫기
                    </button>
                </div>
                <div className="flex flex-wrap gap-4 overflow-y-auto lg:mx-[3vw]  max-h-[50vh] overflow-y-auto">
                    {filteredItems.map((item) =>
                        "title" in item ? (
                            <div
                                key={item.id}
                                className={`p-1 lg:p-2 border ${selectedItems.includes(item) ? "border-2 border-red-600" : "border-gray-300"} relative rounded-lg bg-white w-full h-[5vh] lg:w-[16vw] lg:h-[10vh] cursor-pointer`}
                                onClick={() => toggleSelection(item)}
                            >
                                <div className="hidden lg:block absolute top-0 right-0 mt-1 mr-1">
                                    <img src={start_gray} alt="즐겨찾기x" className="w-[1.2vw] h-[1.2vw]" />
                                </div>
                                <div className="text-left font-bold text-base bg-transparent ml-[1vw] lg:mt-[2vh]">
                                    {item.title}
                                </div>
                            </div>
                        ) : (
                            <div
                                key={item.id}
                                className={`p-1 lg:p-2 border ${selectedItems.includes(item) ? "border-2 border-red-600" : "border-gray-300"} relative rounded-lg bg-blue-100 w-full h-[5vh] lg:w-[16vw] lg:h-[10vh] cursor-pointer`}
                                onClick={() => toggleSelection(item)}
                            >
                                <div className="hidden lg:block absolute top-0 right-0 mt-1 mr-1">
                                    <img src={start_gray} alt="즐겨찾기x" className="w-[1.2vw] h-[1.2vw]" />
                                </div>
                                <div className="text-left font-bold text-base bg-transparent ml-[1vw] lg:mt-[2vh]">
                                    {item.name}
                                </div>
                            </div>
                        )
                    )}
                </div>

                {/* 폴더 이동 버튼 */}
                {mode === "move" && (
                    <div className="mt-4">
                        <h3 className="font-bold text-lg mb-2">이동할 폴더 선택</h3>
                        <select
                            className="w-[66vw] p-1 border border-gray-300 rounded-lg lg:w-[68vw] lg:mx-[3vw] lg:my-[2vh] lg:h-[5vh] "
                            value={selectedFolderId ?? ""}
                            onChange={(e) => setSelectedFolderId(Number(e.target.value))}
                        >
                            <option value="" disabled>
                                폴더 선택
                            </option>
                            {folders.map((folder) => (
                                <option key={folder.id} value={folder.id}>
                                    {folder.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* 모드에 따른 버튼 표시 */}
                <div className="flex justify-center mt-4 w-full">
                    {mode === "move" && (
                        <button className="bg-blue-600 text-white py-2 px-4 rounded-lg" onClick={handleMoveToFolder} disabled={selectedFolderId === null}>
                            이동
                        </button>
                    )}

                    {mode === "edit" && selectedItems.length === 1 && "name" in selectedItems[0] && (
                        <div className="flex flex-col items-center w-full">
                            <div className="mt-4 w-full">
                                <div className="text-[3vw] ml-[2vw] mb-[1vh] lg:text-[1.5vw]">새로운 폴더명을 입력해주세요.</div>
                                <input
                                    type="text"
                                    placeholder="폴더 이름"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-[68vw] p-2 border border-gray-300 rounded-lg mx-[3vw]"
                                />
                            </div>
                            <button className="bg-blue-600 text-white py-2 px-4 rounded-lg mt-4" onClick={handleEdit}>
                                수정
                            </button>
                        </div>
                    )}

                    {mode === "delete" && (
                        <button className="bg-red-600 text-white py-2 px-4 rounded-lg" onClick={handleDeleteClick}>
                            삭제
                        </button>
                    )}
                </div>

                {showConfirmModal && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
                        <div className="flex flex-col items-center bg-white p-6 rounded-lg w-[80vw] lg:w-[40vw] h-auto border-2 border-gray-300">
                            <h2 className="text-2xl font-bold mb-4">정말 삭제하시겠습니까?</h2>
                            <p className="text-center mb-6">삭제 후 복구는 불가능합니다.</p>
                            <div className="flex justify-center">
                                <button className="bg-red-600 text-white py-2 px-4 rounded-lg mx-[0.5vw]" onClick={handleDelete}>
                                    확인
                                </button>
                                <button className="border border-gray-300 text-gray-400 text-black py-2 px-4 rounded-lg mx-[0.5vw]" onClick={() => setShowConfirmModal(false)}>
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActionModal;

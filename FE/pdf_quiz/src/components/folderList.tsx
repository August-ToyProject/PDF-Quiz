import React, { useEffect, useState } from 'react';
import { ListQuiz } from '../pages/MyPage.tsx';
import folder from '../assets/folder2.png';
import resetIcon from '../assets/reset.png';
import { deleteFolder, createFolder, updateFolderName, fetchFolders, fetchFolderQuizzes } from '../api/ApiFolder';
import { fetchQuizzes } from '../api/ApiQuiz';

interface Folder {
    id: number;
    name: string;
    isEditing: boolean;
}

interface FolderListProps {
    folders: Folder[];
    setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
    selectedFolderId: number | null;
    setSelectedFolderId: React.Dispatch<React.SetStateAction<number | null>>;
    setQuiz: React.Dispatch<React.SetStateAction<ListQuiz[]>>;  
}

const FolderList: React.FC<FolderListProps> = ({ 
    folders, 
    setFolders, 
    setSelectedFolderId,
    setQuiz
}) => {
    const [dropdownOpen, setDropdownOpen] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        const fetchData = async() => {
            try{
                const folderData = await fetchFolders();
                if(folderData && Array.isArray(folderData)){
                    setFolders(folderData.map((folder:any) => ({
                        id: folder.folderId,
                        name: folder.folderName,
                        isEditing: false,
                    })));
                }else{
                    setFolders([]);
                }
            }catch(error){
                console.log("폴더 데이터를 가져오는 중 에러 발생", error);
                setFolders([]);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!dropdownOpen || Object.values(dropdownOpen).every(isOpen => !isOpen)) return;

            const target = event.target as Node;
            const isInsideDropdown = Object.keys(dropdownOpen).some(quizId => {
                const element = document.getElementById(`dropdown-${quizId}`);
                return element && element.contains(target);
            });

            if (!isInsideDropdown) {
                setDropdownOpen({});
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [dropdownOpen]);

    const handleFolderClick = async (folderId: number | null) => {
        if (folderId !== null) {
            try {
                const quizzes = await fetchFolderQuizzes(folderId);
                console.log('Fetched quizzes:', quizzes);
                setQuiz(quizzes.exams);
            } catch (error) {
                console.error("폴더의 시험지를 가져오는 중 에러 발생:", error);
            }
        }
    };

    const handleDeleteFolder = async (folderId: number) => {
        try {
            await deleteFolder(folderId);
            setFolders(prevFolders => prevFolders.filter(folder => folder.id !== folderId));
        } catch (error) {
            console.log("폴더 삭제에 실패했습니다.", error);
        }
    };

    const toggleDropdown = (quizId: number, e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setDropdownOpen(prev => ({
            ...prev,
            [quizId]: !prev[quizId]
        }));
    };

    const generateTemporaryId = () => {
        return -(Math.floor(Math.random() * 100000)); // 임시 ID를 음수로 설정
    };

    const handleFolderAction = async (
        action: 'add' | 'editName' | 'saveName' | 'keyPress' | 'edit',
        id?: number,
        folderName?: string,
        event?: React.KeyboardEvent<HTMLInputElement>
    ) => {
        switch (action) {
            case 'add': // 폴더 생성
                const tempId = generateTemporaryId(); // 임시 ID 생성
                const newFolder: Folder = { id: tempId, name: '새 폴더', isEditing: true };
                setFolders(prevFolders => [...prevFolders, newFolder]);
                break;

            case 'editName': // 폴더 이름 편집 상태로 전환
                setFolders(prevFolders =>
                    prevFolders.map(folder =>
                        folder.id === id ? { ...folder, isEditing: true } : folder
                    )
                );
                break;

            case 'saveName': // 폴더 이름 저장 (API 호출)
                if (id && folderName) {
                    try {
                        if (id < 0) {  // 폴더 최초 생성 시
                            const savedFolder = await createFolder(folderName);
                            setFolders(prevFolders =>
                                prevFolders.map(folder =>
                                    folder.id === id
                                        ? { ...folder, id: savedFolder.id, name: savedFolder.name, isEditing: false }
                                        : folder
                                )
                            );
                        } else {
                            await updateFolderName(id, folderName);
                            setFolders(prevFolders =>
                                prevFolders.map(folder =>
                                    folder.id === id
                                        ? { ...folder, isEditing: false, name: folderName } 
                                        : folder
                                )
                            );
                        }
                        console.log(`폴더 "${folderName}" 저장 완료`);
                    } catch (error) {
                        console.error("폴더 이름 저장 중 오류 발생:", error);
                    }
                }
                break;

            case 'keyPress': // 엔터 입력 처리
                if (event?.key === 'Enter' && folderName) {
                    event.preventDefault();
                    handleFolderAction('saveName', id, folderName);
                }
                break;

            case 'edit': // 폴더 이름 변경 (사용자가 폴더 이름을 입력할 때)
                setFolders(prevFolders =>
                    prevFolders.map(folder =>
                        folder.id === id ? { ...folder, name: folderName! } : folder
                    )
                );
                break;

            default:
                break;
        }
    };

    const handleResetClick = async () => {
        setSelectedFolderId(null);
    
        try {
            const allQuizzes = await fetchQuizzes();
            const sortedQuizzes = allQuizzes.sort((a: ListQuiz, b: ListQuiz) => 
                new Date(b.examDate).getTime() - new Date(a.examDate).getTime()
            );
            setQuiz(sortedQuizzes);
        } catch (error) {
            console.error("전체 시험지를 가져오는 중 에러 발생:", error);
        }
    };

    return (
        <div className="border border-gray-300 rounded-lg bg-gray-50 p-4 h-48 flex flex-wrap overflow-x-auto">
            <div className="flex justify-end w-full">
                <img 
                    src={resetIcon} 
                    alt="리셋" 
                    className="relative w-4 h-4 cursor-pointer" 
                    onClick={handleResetClick} 
                />
            </div>
            <div 
                className="border-2 border-dashed border-blue-600 rounded-lg w-32 h-full mr-4 flex items-center justify-center cursoer-pointer"
                onClick={() => handleFolderAction('add')}
            >
                <span className='text-blue-600 text-2xl'>+</span>
            </div>
            {folders.map((folderItem, index) => (
                <div 
                    key={folderItem.id || `folder-${index}`}
                    className="relative flex flex-col items-center mx-6 mt-2"
                    onClick={() => handleFolderClick(folderItem.id)}
                >
                    <button 
                        className="text-gray-500 hover:text-gray-700 focus:outline-none bg-transparent flex items-center ml-auto h-4 w-4 p-1"
                        onClick={(e) => {
                            toggleDropdown(folderItem.id, e)
                        }}
                    >
                        &#x2026;
                    </button>
                    {dropdownOpen[folderItem.id] && (
                            <div className='absolute w-15 border border-gray-300 rounded-lg shadow-lg bg-trasperent'>
                                <button 
                                    className="w-full text-left text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteFolder(folderItem.id);
                                    }}
                                >
                                    삭제
                                </button>
                            </div>
                        )}
                    <img src={folder} alt="폴더" className="w-24 h-24" />
                    {folderItem.isEditing ? (
                        <input
                            type="text"
                            value={folderItem.name}
                            onChange={(e) => handleFolderAction('edit', folderItem.id, e.target.value)}
                            onBlur={() => { handleFolderAction('saveName', folderItem.id, folderItem.name); }}
                            onKeyDown={(event) => handleFolderAction('keyPress', folderItem.id, folderItem.name, event)}

                            placeholder="폴더 이름"
                            className="mt-2 w-24 border border-gray-300 rounded-lg text-center"
                            autoFocus
                        />
                    ) : (
                        <div 
                            className='mt-2 w-24 text-center cursor-pointer'
                            onClick={() => handleFolderAction('editName', folderItem.id)}
                        >
                            {folderItem.name}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default FolderList;

import React, {useState} from 'react';
import folder from '../assets/folder2.png';
import FolderModal from '../Modal/folderModal';
import searchIcon from '../assets/search.png'; 
import {deleteFolder, createFolder, updateFolderName, moveQuizToFolder, fetchFolderQuizzes} from '../api/ApiFolder';

interface ListQuiz {
    id: number;
    title: string;
    date: string;
    folderId: number | null;
}

interface Folder {
    id: number;
    name: string;
    isEditing: boolean;
}

interface FolderListProps {
    folders: Folder[];
    setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
    quiz: ListQuiz[];
    setQuiz: React.Dispatch<React.SetStateAction<ListQuiz[]>>;
    selectedFolderId: number | null;
    setSelectedFolderId: React.Dispatch<React.SetStateAction<number | null>>;
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

const FolderList: React.FC<FolderListProps> = ({ 
    folders, 
    setFolders, 
    quiz, 
    setQuiz,
    selectedFolderId,
    setSelectedFolderId,
    searchTerm,
    setSearchTerm
}) => {

    const [showFolderModal, setShowFolderModal] = useState(false);
    const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState<{ [key: number]: boolean }>({});

    const toggleDropdown = (quizId: number) => {
        setDropdownOpen(prev => ({
            ...prev,
            [quizId]: !prev[quizId]
        }));
    };
    const handleFolderClick = async (folderId: number | null) => {
        setSelectedFolderId(folderId);
        try{
            const data = await fetchFolderQuizzes(folderId);
            setQuiz(data);
        }catch(error){
            console.log("폴더 데이터를 가져오는데 실패했습니다.", error);
        }
    }

    const handleDeleteQuiz = async(quizId: number) =>{
        try{
            await deleteFolder(quizId);
            setQuiz(prevQuiz => prevQuiz.filter(q => q.id != quizId))
        }catch(error){
            console.log("퀴즈 삭제에 실패하였습니다.", error);
        }
    }


    // 검색창
    const handleSearchClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value;
        setSearchTerm(searchTerm);
    };

    // 폴더와 검색어에 따라 퀴즈를 필터링
    const filteredQuizzes = quiz
        .filter(item => 
            (selectedFolderId === null || item.folderId === selectedFolderId) && 
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

    const handleFolderAction = async (
        action : 'add' | 'editName' | 'saveName' | 'keyPress' | 'edit',
        id? : number,
        newName? : string,
        event? : React.KeyboardEvent<HTMLInputElement>
    ) => {
        switch(action) { 
            case 'add' : // 폴더 생성
                try{
                    const newFolder = await createFolder(newName || '');
                    setFolders(prevFolders => [...prevFolders, newFolder]);
                }catch(error){
                    console.error("폴더 생성 중 오류 발생:", error);
                }
                break;
            case 'editName' : // 폴더 이름 편집 상태로 전환
                setFolders(prevFolders =>
                    prevFolders.map(folder =>
                        folder.id === id ? {...folder, isEditing: true} : folder
                    )
                );
                break;
            case 'saveName' : // 폴더 이름 저장
                if(id && newName){
                    try{
                        await updateFolderName(id, newName);
                        setFolders(prevFolders =>
                            prevFolders.map(folder =>
                                folder.id === id 
                                    ? {...folder, isEditing: false, name: newName} : folder
                            )
                        );
                    }catch(error){
                        console.error("폴더 이름 수정 중 오류 발생:", error);
                    }
                }
                break;
            case 'keyPress' : // 엔터 입력 처리
                if(event?.key === 'Enter'){
                    event.preventDefault();
                    handleFolderAction('saveName', id);
                }
                break;
            case 'edit' : // 폴더 이름 변경
                setFolders(prevFolders =>
                    prevFolders.map(folder =>
                        folder.id === id ? {...folder, name: newName!} : folder
                    )
                );
                break;
            default :
                break;
        }
    };

    const openFolderModal = (quizId: number) => {
        setSelectedQuizId(quizId);
        setShowFolderModal(true);
    };

    const closeFolderModal = () => {
        setShowFolderModal(false);
        setSelectedQuizId(null);
    };

    const handleFolderConfirm = async (folderId: number | null) => {
        // API테스트
        if(selectedQuizId !== null && folderId !== null){
            try{
                await moveQuizToFolder(selectedQuizId, folderId);
                setQuiz(prevQuiz => 
                    prevQuiz.map(q => 
                        q.id === selectedQuizId ? { ...q, folderId } : q
                    )
                );
            }catch(error){
                console.log("퀴즈를 폴더로 이동하는데 실패하였습니다.", error);
            }
        }
        closeFolderModal();
    };

    return (
        <>
            <div className="border border-gray-300 rounded-lg bg-gray-50 p-4 h-48 flex flex-wrap overflow-x-auto">
                <div 
                    className="border-2 border-dashed border-blue-600 rounded-lg w-32 h-full mr-4 flex items-center justify-center cursoer-pointer"
                    onClick={() => handleFolderAction('add')}
                >
                    <span className='text-blue-600 text-2xl'>+</span>
                </div>
                {folders.map(folderItem => (
                    <div 
                        key={folderItem.id} 
                        className="flex flex-col items-center mt-4 mx-6 mt-8"
                        onClick={() => handleFolderClick(folderItem.id)}
                    >
                        <img src={folder} alt="폴더" className="w-24 h-24" />
                        {folderItem.isEditing ? (
                            <input
                                type="text"
                                value={folderItem.name}
                                onChange={(e) => handleFolderAction('edit', folderItem.id, e.target.value)}
                                onBlur={() => {
                                    if (folderItem.name.trim() !== "") {
                                        handleFolderAction('saveName', folderItem.id);
                                    }
                                }}
                                onKeyDown={(e) => handleFolderAction('keyPress', folderItem.id, undefined, e)}
                                placeholder="폴더 이름"
                                className="mt-2 w-24 border border-gray-300 rounded-lg text-center"
                                autoFocus
                            />
                        ) : (
                            <div className='mt-2 w-24 text-center cursor-pointer'>
                                {folderItem.name}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="relative mt-4">
                <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={handleSearchClick}
                    className="p-2 w-full border border-gray-300 rounded-lg pl-3 pr-10"
                />
                <div className="absolute right-3 top-2.5 bg-transparent p-0 border-none">
                    <img src={searchIcon} alt="Search" className="w-5 h-5"/>
                </div>
            </div>
            <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50 overflow-y-auto h-80 flex-grow">
                <div className="space-y-4">
                    {filteredQuizzes.map(item => (
                        <div key={item.id} className="flex justify-between p-4 border border-gray-300 rounded-lg bg-white">
                            <div className="font-bold text-sm">{item.title}</div>
                            <div className='flex justify-center'>
                                <div className="text-gray-500 text-sm lefo mr-4">{item.date}</div>
                                <div className='relative'>
                                    <button 
                                        className='text-gray-500 hover:text-gray-700 focus:outline-none bg-transparent flex items-center justify-center h-4 w-4 p-1'
                                        onClick={() => toggleDropdown(item.id)}
                                    >
                                        &#x2026;
                                    </button>
                                    {dropdownOpen[item.id] && (
                                        <div className='absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-50'>
                                            <button 
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => openFolderModal(item.id)}
                                            >
                                                폴더로 이동
                                            </button>
                                            <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                오답노트
                                            </button>
                                            <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                재시험
                                            </button>
                                            <button 
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => handleDeleteQuiz(item.id)}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {showFolderModal && (
                <FolderModal
                    folders={folders}
                    onClose={closeFolderModal}
                    onConfirm={handleFolderConfirm}
                />
            )}
        </>
    );
};

export default FolderList;

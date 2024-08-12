import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Upload from '../Modal/Upload';
import searchIcon from '../assets/search.png'; 

interface ListQuiz {
    id: number;
    title: string;
    date: string;
}

const months = [
    { name: 'Jan', days: 31 },
    { name: 'Feb', days: 28 },
    { name: 'Mar', days: 31 },
    { name: 'Apr', days: 30 },
    { name: 'May', days: 31 },
    { name: 'Jun', days: 30 },
    { name: 'Jul', days: 31 },
    { name: 'Aug', days: 31 },
    { name: 'Sep', days: 30 },
    { name: 'Oct', days: 31 },
    { name: 'Nov', days: 30 },
    { name: 'Dec', days: 31 },
];

export default function MyPage() {
    const [showModal, setShowModal] = useState(false); // 모달
    const [quiz, setQuiz] = useState<ListQuiz[]>([]); // 퀴즈 리스트
    const [searchTerm, setSearchTerm] = useState(''); // 검색창
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);  // 캘린더

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    // 리스트 불러오기 (임시)
    useEffect(() => {
        const fetchData = async () => {
            const data : ListQuiz[] = [
                { id: 1, title: 'PDF퀴즈 제목 1', date: '2023-08-01' },
                { id: 2, title: 'PDF퀴즈 제목 2', date: '2023-08-02' },
                { id: 3, title: 'PDF퀴즈 제목 3', date: '2023-08-03' },
                { id: 4, title: 'PDF퀴즈 제목 4', date: '2023-08-04' },
                { id: 5, title: 'PDF퀴즈 제목 5', date: '2023-08-05' },
                { id: 6, title: 'PDF퀴즈 제목 6', date: '2023-08-06' },
                { id: 7, title: 'PDF퀴즈 제목 7', date: '2023-08-07' },
                { id: 8, title: 'PDF퀴즈 제목 8', date: '2023-08-08' },
            ];
            setQuiz(data);
        };

        fetchData();
    }, []);

    // 검색어로 리스트 검색
    const handleSearchClick = () => {
        const filteredQuiz = quiz.filter(item =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setQuiz(filteredQuiz);
    };

    // 캘린더
    const createCalendarSquares = (days: number) => {
        const squares = [];
        for (let i = 1; i <= days; i++) {
            squares.push(
                <div key={i} className="w-9 h-9 m-0.5 bg-white border border-gray-400 rounded-lg flex items-center justify-center text-gray-300">
                    {i}
                </div>
            );
        }
        return squares;
    };


    return(
        <div className="h-screen w-full flex flex-col items-center bg-white">
            <div className="absolute top-0 left-0 w-full">
                <div className="text-blue-600 text-xl mt-4 mx-4 font-bold">
                    PDF Quiz
                </div>
                <div className="absolute left-0 right-0 h-[2px] bg-gray-300 mt-1 mx-4"></div>
            </div>
            <div className="absolute top-10 left-0 w-full h-full font-bold flex">    
                {/* 좌측 옵션 */}
                <div className="flex flex-col mt-6 mx-4">
                    <div className="text-blue-600 text-xs">마이프로필</div>
                    <div className="mt-2 p-4 border border-gray-300 rounded-lg w-[12rem] h-24">
                        <div className='text-center'>닉네임</div>
                        <div className="flex justify-center space-x-4 mt-4">
                            <button className="px-2 py-1 bg-gray-50 border border-gray-300 text-xs text-gray-500 rounded-lg">내 정보</button>
                            <button className="px-2 py-1 bg-gray-50 border border-gray-300 text-xs text-gray-500 rounded-lg">로그아웃</button>
                        </div>
                    </div>
                    <button className='bg-blue-600 mt-4 text-white font-bold' onClick={openModal}>PDF Upload</button>
                    <div className="mt-4 p-4 flex justify-center text-xs border border-gray-300 rounded-lg w-full h-[475px] bg-white">오 답 노 트</div>
                </div>
                {/* 리스트 */}
                <div className="absolute text-blue-600 text-xs mt-6" style={{ left: '15.5rem' }}>퀴즈 리스트</div>
                <div className='flex flex-col'>
                    <div className="mx-4 border border-gray-300 rounded-lg w-[600px] h-[200px] bg-gray-50" style={{marginTop: '3rem'}}>
                        <div className='border-2 border-dashed border-blue-600 rounded-lg w-[120px] h-[150px] mt-6 ml-4 flex items-center justify-center'>
                            <span className='text-blue-600 text-2xl'>+</span>
                        </div>
                    </div>
                    <div className="relative mt-4 mx-4 mb-4" style={{ width: '600px' }}>
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="p-1 w-full border border-gray-300 rounded-lg pl-3 pr-10"
                        />
                        <button onClick={handleSearchClick} className="absolute right-2 top-2 bg-transparent p-0" style={{ padding: '0', margin: '0', border: 'none' }}>
                            <img src={searchIcon} alt="Search" className="w-5 h-5"/>
                        </button>
                    </div>
                    <div className="mx-4 p-4 border border-gray-300 rounded-lg w-[600px] h-[380px] bg-gray-50 overflow-y-auto">
                        <div className="space-y-4">
                            {quiz.map(item => (
                                <div key={item.id} className="flex justify-between p-4 border border-gray-300 rounded-lg bg-white">
                                    <div className="font-bold text-sm">{item.title}</div>
                                    <div className="text-gray-500 text-sm">{item.date}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* 캘린더 */}
                <div className="absolute text-blue-600 text-xs mt-6" style={{ left: '55rem' }}>캘린더</div>
                <div className="mx-4 ml-4 bg-blue-600 rounded-lg w-[530px] h-[200px] p-4 border border-gray-300" style={{ marginTop: '3rem' }}>
                    <div className="flex justify-between mb-4">
                        {months.map((month, index) => (
                            <button
                                key={index}
                                className={`px-1 py-1 text-xs rounded font-bold ${selectedMonth === index ? 'bg-white text-blue-600 rounded-lg' : 'bg-transparent text-white'}`}
                                onClick={() => setSelectedMonth(index)}
                            >
                                {month.name}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap justify-start ml-7">
                        {selectedMonth !== null && createCalendarSquares(months[selectedMonth].days)}
                    </div>
                    {/* 기능 미정 */}
                    <div className="absolute text-blue-600 text-xs mt-6" style={{ left: '55rem', top: '16rem' }}>기능 미정</div>
                    <div className="ml-4 bg-white rounded-lg w-[530px] h-[380px] p-4 border border-gray-300" style={{ marginTop: '5.5rem', right: '2rem', position: 'relative' }}>
                    
                    </div>
                </div>
            </div>
            <Upload showModal={showModal} closeModal={closeModal} />
        </div>
    )
}
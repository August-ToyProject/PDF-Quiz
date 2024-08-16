import { useState, useEffect } from 'react';
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
    const [showModal, setShowModal] = useState(false); 
    const [quiz, setQuiz] = useState<ListQuiz[]>([]);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);  

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

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
                { id: 9, title: 'PDF퀴즈 제목 9', date: '2023-08-09' },
                { id: 10, title: 'PDF퀴즈 제목 10', date: '2023-08-10' },
                { id: 11, title: 'PDF퀴즈 제목 11', date: '2023-08-11' },
            ];
            setQuiz(data);
        };

        fetchData();
    }, []);

    const handleSearchClick = () => {
        const filteredQuiz = quiz.filter(item =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setQuiz(filteredQuiz);
    };

    const recentQuizzes = quiz
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

    const createCalendarSquares = (days: number) => {
        const squares = [];
        for (let i = 1; i <= days; i++) {
            squares.push(
                <div key={i} className="w-7 h-7 m-1 bg-white border border-gray-400 rounded-lg flex items-center justify-center text-gray-300">
                    {i}
                </div>
            );
        }
        return squares;
    };

    return (
        <div className="h-screen w-screen flex flex-col items-center bg-white overflow-x-hidden min-w-[600px]">
            <div className="w-full ">
                <div className="text-blue-600 text-xl mt-4 mx-4 font-bold">
                    PDF Quiz
                </div>
                <div className="h-[2px] bg-gray-300 mt-1 mx-4"></div>
            </div>
            
            <div className="flex flex-col lg:flex-row w-full mt-10 mx-4 lg:space-x-6 space-y-6 lg:space-y-0">
                {/* 좌측 옵션 */}
                <div className="hidden lg:flex flex-col flex-none w-56 ml-6">
                    <div className="text-blue-600 text-xs font-black">마이프로필</div>
                    <div className="mt-2 p-4 border border-gray-300 rounded-lg h-24">
                        <div className='text-center'>닉네임</div>
                        <div className="flex justify-center space-x-4 mt-4">
                            <button className="px-2 py-1 bg-gray-50 border border-gray-300 text-xs text-gray-500 rounded-lg">내 정보</button>
                            <button className="px-2 py-1 bg-gray-50 border border-gray-300 text-xs text-gray-500 rounded-lg">로그아웃</button>
                        </div>
                    </div>
                    <button className='bg-blue-600 mt-4 text-white font-bold p-2 rounded-lg' onClick={openModal}>PDF Upload</button>
                    <div className="mt-4 p-4 flex justify-center text-xs border border-gray-300 rounded-lg h-full bg-white">오 답 노 트</div>
                </div>

                {/* 퀴즈 리스트 */}
                <div className="flex-grow h-full max-w-xl w-full lg:max-w-2xl mx-auto min-w-[300px]">
                    <div className="text-blue-600 text-xs mb-2 font-black">퀴즈 리스트</div>
                    <div className="border border-gray-300 rounded-lg bg-gray-50 p-4 h-48">
                        <div className="border-2 border-dashed border-blue-600 rounded-lg w-32 h-full flex items-center justify-center">
                            <span className='text-blue-600 text-2xl'>+</span>
                        </div>
                    </div>
                    <div className="relative mt-4">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="p-2 w-full border border-gray-300 rounded-lg pl-3 pr-10"
                        />
                        <button onClick={handleSearchClick} className="absolute right-3 top-2.5 bg-transparent p-0 border-none">
                            <img src={searchIcon} alt="Search" className="w-5 h-5"/>
                        </button>
                    </div>
                    <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50 overflow-y-auto h-80 flex-grow">
                        <div className="space-y-4">
                            {recentQuizzes.map(item => (
                                <div key={item.id} className="flex justify-between p-4 border border-gray-300 rounded-lg bg-white">
                                    <div className="font-bold text-sm">{item.title}</div>
                                    <div className="text-gray-500 text-sm">{item.date}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>                
                {/* 캘린더 */}
                <div className="flex-grow max-w-2xl lg:flex-none lg:w-98 overflow-hidden mx-auto">
                    <div className="text-blue-600 text-xs mb-2 font-black">캘린더</div>
                    <div className="bg-blue-600 rounded-lg p-2 border border-gray-300 w-full mb-28" style={{ height: '12rem' }}>
                        <div className="flex justify-between mb-2">
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
                        <div className="grid grid-cols-8 mb-2 ml-3 justify-center">
                            {selectedMonth !== null && createCalendarSquares(months[selectedMonth].days)}
                        </div>
                    </div>
                </div>
            </div>
            <Upload showModal={showModal} closeModal={closeModal} />
        </div>
    )
}
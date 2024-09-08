import { useState, useEffect } from "react";
import Upload from "../Modal/Upload";
import { useNavigate } from "react-router-dom";
import FolderList from "../components/folderList";
import FolderModal from "../Modal/folderModal";
import { fetchUserNickname, logoutUser } from "../api/ApiUser";
import { deleteQuiz, fetchQuizzes } from "../api/ApiQuiz";
import BlueLogo from "../assets/Logo_blue.svg";
import Banner from "../assets/Banner2.png";

export interface ListQuiz {
  id: number;
  title: string;
  examDate: string;
  folderId: number | null;
}

interface User {
  nickname: string;
}

const months = [
  { name: "Jan", days: 31 },
  { name: "Feb", days: 28 },
  { name: "Mar", days: 31 },
  { name: "Apr", days: 30 },
  { name: "May", days: 31 },
  { name: "Jun", days: 30 },
  { name: "Jul", days: 31 },
  { name: "Aug", days: 31 },
  { name: "Sep", days: 30 },
  { name: "Oct", days: 31 },
  { name: "Nov", days: 30 },
  { name: "Dec", days: 31 },
];

export default function MyPage() {
  const [showModal, setShowModal] = useState(false);
  const [quiz, setQuiz] = useState<ListQuiz[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [folders, setFolders] = useState<
    { id: number; name: string; isEditing: boolean }[]
  >([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [folderModalOpen, setFolderModalOpen] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 유저 닉네임 가져오기
        const userInfo = await fetchUserNickname();
        setUser(userInfo);

        // 퀴즈 리스트 가져오기
        const quizData = await fetchQuizzes();
        setQuiz(quizData);
      } catch (error) {
        console.log("데이터를 가져오는데 실패했습니다.", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !dropdownOpen ||
        Object.values(dropdownOpen).every((isOpen) => !isOpen)
      )
        return;

      const target = event.target as Node;
      const isInsideDropdown = Object.keys(dropdownOpen).some((quizId) => {
        const element = document.getElementById(`dropdown-${quizId}`);
        return element && element.contains(target);
      });

      if (!isInsideDropdown) {
        setDropdownOpen({});
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownOpen]);

  // 로그아웃
  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("accesstoken");
      console.log("로그아웃이 성공적으로 완료되었습니다.");
      navigate("/");
    } catch (error) {
      console.log("로그아웃 중 오류가 발생했습니다.", error);
    }
  };

  const handleInfo = () => {
    const token = localStorage.getItem("accesstoken");
    if (token) {
      navigate(`/info`);
    } else {
      console.log("토큰이 없습니다. 로그인 페이지로 이동해야 합니다.");
      navigate("/login");
    }
  };

  const toggleDropdown = (
    quizId: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    setDropdownOpen((prev) => ({
      ...prev,
      [quizId]: !prev[quizId],
    }));
  };

  const handleDeleteQuiz = async (quizId: number) => {
    try {
      await deleteQuiz(quizId);
      setQuiz((prevQuiz) => prevQuiz.filter((q) => q.id !== quizId));
    } catch (error) {
      console.log("퀴즈 삭제에 실패하였습니다.", error);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}. ${month}. ${day}`;
  };

  // 캘린더 생성 함수
  const createCalendarSquares = (days: number) => {
    const squares = [];
    for (let i = 1; i <= days; i++) {
      squares.push(
        <div
          key={i}
          className="w-7 h-7 m-1 bg-white border border-gray-400 rounded-lg flex items-center justify-center text-gray-300"
        >
          {i}
        </div>
      );
    }
    return squares;
  };

  const openFolderModal = (quizId: number) => {
    setSelectedQuizId(quizId);
    setFolderModalOpen(true);
  };

  const closeFolderModal = () => {
    setFolderModalOpen(false);
    setSelectedQuizId(null);
  };

  // 검색 및 폴더 선택에 따른 퀴즈 필터링
  const filteredQuizzes = quiz
    .filter(
      (item) =>
        (selectedFolderId === null || item.folderId === selectedFolderId) &&
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort(
      (a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime()
    )
    .slice(0, 10);

  return (
    <div className="h-screen w-screen flex flex-col items-center bg-white overflow-x-hidden min-w-[600px]">
      {/* 상단 바 및 사용자 정보 */}
      <div className="w-full h-[100px]">
        <img src={BlueLogo} alt="Quizgen" className="w-36 h-24 ml-5" />
        {/* <div className="text-blue-600 text-lg mt-4 mx-4 font-bold">QuizGen</div> */}
        <div className="h-[2px] bg-gray-300 mx-4"></div>
      </div>

      <div className="flex flex-col lg:flex-row w-full mt-4 mx-4 lg:space-x-6 space-y-6 lg:space-y-0">
        {/* 좌측 옵션 */}
        <div className="hidden lg:flex flex-col flex-none w-56 ml-6">
          <div className="font-body text-blue-600 text-lg font-black">
            마이프로필
          </div>
          <div className="mt-2 p-4 border border-gray-300 rounded-lg h-24">
            <div className="font-body font-bold text-center">
              {user?.nickname || "닉네임"}
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <button
                className="font-body px-2 py-1 bg-gray-50 border border-gray-300 text-xs text-gray-500 rounded-lg"
                onClick={handleInfo}
              >
                내 정보
              </button>
              <button
                className="font-body px-2 py-1 bg-gray-50 border border-gray-300 text-xs text-gray-500 rounded-lg"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </div>
          </div>
          <button
            className="font-body bg-blue-600 mt-4 text-white font-bold p-2 rounded-lg"
            onClick={openModal}
          >
            PDF Upload
          </button>
          <a href="https://forms.gle/jmuCNSTjQL52fek4A">
            <img src={Banner} alt="Banner" className="mt-4" />
          </a>

          {/* <div className="font-body mt-4 p-4 flex justify-center text-lg border border-gray-300 rounded-lg h-full bg-white tracking-wider">
            오답노트
          </div> */}
        </div>

        <div className="flex-grow h-full max-w-xl w-full lg:max-w-2xl mx-auto min-w-[300px]">
          {/* 폴더 리스트 */}
          <div className="font-body text-blue-600 text-lg mb-2 font-black">
            폴더 리스트
          </div>
          <FolderList
            folders={folders}
            setFolders={setFolders}
            selectedFolderId={selectedFolderId}
            setSelectedFolderId={setSelectedFolderId}
            setQuiz={setQuiz}
          />

          {/* 검색창 */}
          <div className="relative mt-6">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 w-full border border-gray-300 rounded-lg pl-3 pr-10"
            />
          </div>

          {/* 퀴즈 리스트 */}
          <div className=" font-body text-blue-600 text-lg my-2 font-black">
            퀴즈 리스트
          </div>
          <div className="mt-2 p-4 border border-gray-300 rounded-lg bg-gray-50 overflow-y-auto h-80 flex-grow">
            <div className="space-y-4">
              {filteredQuizzes.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between p-4 border border-gray-300 rounded-lg bg-white"
                >
                  <div className="font-bold text-sm">{item.title}</div>
                  <div className="flex justify-center">
                    <div className="text-gray-500 text-sm lefo mr-4">
                      {formatDate(item.examDate)}
                    </div>
                    <div className="relative">
                      <button
                        className="text-gray-500 hover:text-gray-700 focus:outline-none bg-transparent flex items-center justify-center h-4 w-4 p-1"
                        onClick={(e) => toggleDropdown(item.id, e)}
                      >
                        &#x2026;
                      </button>
                      {dropdownOpen[item.id] && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              openFolderModal(item.id);
                            }}
                          >
                            폴더로 이동
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuiz(item.id);
                            }}
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
        </div>

        {/* 캘린더 */}
        <div className="flex-grow max-w-2xl lg:flex-none lg:w-98 overflow-hidden mx-auto">
          <div className="text-blue-600 text-lg mb-2 font-black">캘린더</div>
          <div
            className="bg-blue-600 rounded-lg p-2 border border-gray-300 w-full mb-28"
            style={{ height: "12rem" }}
          >
            <div className="flex justify-between mb-2">
              {months.map((month, index) => (
                <button
                  key={index}
                  className={`px-1 py-1 text-xs rounded font-bold ${
                    selectedMonth === index
                      ? "bg-white text-blue-600 rounded-lg"
                      : "bg-transparent text-white"
                  }`}
                  onClick={() => setSelectedMonth(index)}
                >
                  {month.name}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-8 mb-2 ml-3 justify-center">
              {selectedMonth !== null &&
                createCalendarSquares(months[selectedMonth].days)}
            </div>
          </div>
        </div>
      </div>
      <Upload showModal={showModal} closeModal={closeModal} />
      {folderModalOpen && (
        <FolderModal
          folders={folders}
          onClose={closeFolderModal}
          selectedQuizId={selectedQuizId}
          setQuiz={setQuiz}
        />
      )}
    </div>
  );
}

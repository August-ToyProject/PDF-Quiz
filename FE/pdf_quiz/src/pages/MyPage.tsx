import { useState, useEffect } from "react";
import Upload from "../Modal/Upload";
import { useNavigate } from "react-router-dom";
import { fetchUserNickname, logoutUser } from "../api/ApiUser";
import { fetchQuizzes } from "../api/ApiQuiz";
import center_image from "../assets/center_image.png";
// import star_yellow from "../assets/Star_yellow.png"
import star_gray from "../assets/Star_gray.png";
import Footer from "../components/footer";
import {
  createFolder,
  updateFolderName,
  fetchFolders,
  fetchFolderQuizzes,
} from "../api/ApiFolder";
import ActionModal from "../Modal/actionModal";
import folderImage from "../assets/folder2.png";
import profileImage from "../assets/profileImage.png";
import Header from "../components/Header";

export interface ListQuiz {
  id: number;
  title: string;
  examDate: string;
  folderId: number | null;
}

export interface Folder {
  id: number;
  name: string;
  isEditing: boolean;
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
  const [folders, setFolders] = useState<
    { id: number; name: string; isEditing: boolean }[]
  >([]);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [items, setItems] = useState<(Folder | ListQuiz)[]>([]);
  const [modalMode, setModalMode] = useState<"move" | "delete" | "edit">(
    "move"
  );
  const [showActionModal, setShowActionModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  const openActionModal = (mode: "move" | "delete" | "edit") => {
    setModalMode(mode);
    setShowActionModal(true);
  };
  const closeActionModal = () => setShowActionModal(false);

  const handleDelete = (selectedItems: (Folder | ListQuiz)[]) => {
    setFolders((prevFolders) =>
      prevFolders.filter((folder) => !selectedItems.includes(folder))
    );
    setQuiz((prevQuiz) =>
      prevQuiz.filter((quiz) => !selectedItems.includes(quiz))
    );
    setItems((prevItems) =>
      prevItems.filter((item) => !selectedItems.includes(item))
    );
    closeModal();
  };

  const navigate = useNavigate();

  useEffect(() => {
    const token = new URL(window.location.href).searchParams.get("token");
    if (token) {
      console.log("accesstoken", token);
      localStorage.setItem("accesstoken", token);
    } else if (localStorage.getItem("accesstoken")) {
      console.log("accesstoken", localStorage.getItem("accesstoken"));
    } else {
      console.log("No token found");
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userInfo, quizData, folderData] = await Promise.all([
          fetchUserNickname(), // 유저 닉네임 가져오기
          fetchQuizzes(), // 퀴즈 리스트 가져오기
          fetchFolders(), // 폴더 리스트 가져오기
        ]);

        setUser(userInfo); // 유저 정보 설정
        setQuiz(quizData); // 퀴즈 리스트 설정

        if (folderData && Array.isArray(folderData)) {
          const folderList = folderData.map((folder: any) => ({
            id: folder.folderId,
            name: folder.folderName,
            isEditing: false,
          }));
          setFolders(folderList);

          const sortedFolders = folderList.sort((a: Folder, b: Folder) =>
            a.name.localeCompare(b.name)
          );

          const sortedQuizzes = quizData.sort((a: ListQuiz, b: ListQuiz) =>
            a.title.localeCompare(b.title, undefined, {
              numeric: false,
              sensitivity: "base",
            })
          );

          // 폴더와 퀴즈를 통합한 배열로 저장
          setItems([...sortedFolders, ...sortedQuizzes]);
        }
      } catch (error) {
        console.log("데이터를 가져오는데 실패했습니다.", error);
      }
    };
    fetchData();

    const currentMonth = new Date().getMonth();
    setSelectedMonth(currentMonth);
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowDropdown(true); // lg 이상일 때 항상 열림
      } else {
        setShowDropdown(false); // lg 미만일 때 드롭다운을 닫음
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}. ${month}. ${day}`;
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

  // 캘린더 생성 함수
  const createCalendarSquares = (days: number) => {
    const squares = [];
    for (let i = 1; i <= days; i++) {
      squares.push(
        <div
          key={i}
          className="w-8 h-8 m-1 bg-white border border-gray-400 rounded-lg flex items-center justify-center text-gray-300"
        >
          {i}
        </div>
      );
    }
    return squares;
  };

  const handleFolderClick = async (folderId: number | null) => {
    if (folderId !== null) {
      try {
        const quizzes = await fetchFolderQuizzes(folderId);
        const selectedFolder = folders.find((folder) => folder.id === folderId);

        if (selectedFolder) {
          setSelectedFolder(selectedFolder);
          setQuiz(quizzes.exams);
          setItems([selectedFolder, ...quizzes.exams]);
        }
      } catch (error) {
        console.error("폴더의 시험지를 가져오는 중 에러 발생:", error);
      }
    }
  };

  const handleResetClick = async () => {
    setSelectedFolder(null);
    setSelectedFolderId(null);

    try {
      const allQuizzes = await fetchQuizzes();
      setQuiz(allQuizzes);
      setItems([...folders, ...allQuizzes]);
    } catch (error) {
      console.error("전체 퀴즈를 가져오는 중 에러 발생:", error);
    }
  };

  const handleFolderCreate = async () => {
    if (newFolderName.trim() === "") {
      alert("폴더 이름을 입력하세요.");
      return;
    }
    try {
      const createdFolder = await createFolder(newFolderName);
      const newFolder: Folder = {
        id: createdFolder.id,
        name: createdFolder.name,
        isEditing: false,
      };
      setFolders((prevFolders) => [newFolder, ...prevFolders]);
      setItems((prevItems) => [newFolder, ...prevItems]);
      setShowFolderModal(false);
      setNewFolderName("");
    } catch (error) {
      console.error("폴더 생성 중 오류 발생:", error);
    }
  };

  const handleFolderAction = async (
    action: "editName" | "saveName" | "keyPress" | "edit",
    id?: number,
    folderName?: string,
    event?: React.KeyboardEvent<HTMLInputElement>
  ) => {
    switch (action) {
      case "editName":
        setFolders((prevFolders) =>
          prevFolders.map((folder) =>
            folder.id === id ? { ...folder, isEditing: true } : folder
          )
        );
        break;
      case "saveName":
        if (id && folderName) {
          try {
            await updateFolderName(id, folderName);
            setFolders((prevFolders) =>
              prevFolders.map((folder) =>
                folder.id === id
                  ? { ...folder, isEditing: false, name: folderName }
                  : folder
              )
            );
            setItems((prevItems) =>
              prevItems.map((item) =>
                "name" in item && item.id === id
                  ? { ...item, name: folderName }
                  : item
              )
            );
          } catch (error) {
            console.error("폴더 이름 저장 중 오류 발생:", error);
          }
        }
        break;

      case "keyPress":
        if (event?.key === "Enter" && folderName) {
          event.preventDefault();
          handleFolderAction("saveName", id, folderName);
        }
        break;

      case "edit":
        setFolders((prevFolders) =>
          prevFolders.map((folder) =>
            folder.id === id ? { ...folder, name: folderName! } : folder
          )
        );
        break;

      default:
        break;
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center">
      <div className="flex flex-col w-full min-h-full">
        <Header />
        <div className="lg:flex lg:flex-row h-full">
          {/* 좌측 옵션 */}
          <div className="flex flex-col lg:min-h-full lg:w-72 2xl:w-80">
            <div className="flex justify-center lg:justify-end items-center h-1/2 w-full">
              <div className="mt-8 lg:p-4 bg-gray-50 border-2 border-gray-200 rounded-md w-full mx-6 flex flex-col lg:items-center lg:w-3/4 2xl:w-2/3">
                <div className="flex flex-row lg:flex-col items-center">
                  <div className="w-24 h-24 rounded-full border-2 border-gray-300 bg-transparent my-4 mx-6 lg:w-32 lg:h-32 2xl:w-40 2xl:h-40 overflow-hidden">
                    <img
                      src={profileImage}
                      alt="profileImage"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col space-y-3">
                    <div className="font-body font-bold lg:text-center text-lg lg:text-xl lg:mb-4">
                      {user?.nickname || "닉네임"}
                    </div>
                    <div className="flex justify-center space-x-3 lg:mt-10">
                      <button
                        className="outline-visible font-body px-1 bg-gray-50 border border-gray-300 text-gray-500 rounded-md flex items-center justify-center h-7 w-20 lg:h-7 lg:text-md"
                        onClick={handleInfo}
                      >
                        내 정보
                      </button>
                      <button
                        className="outline-visible font-body px-1 bg-gray-50 border border-gray-300 text-gray-500 rounded-md flex items-center justify-center w-20 h-7 lg:text-md"
                        onClick={handleLogout}
                      >
                        로그아웃
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="my-[3vh] mx-[6vw] flex flex-col lg:mr-[5vw] lg:my-[7vh]">
            <div className="flex lg:flex-row flex-col">
              <div className="flex flex-col w-full jsutify-center items-center lg:mt-[5vh]">
                <div className="w-auto text-4xl font-bold mt-5 md:mt-10 hidden lg:block">
                  PDF만 올리면 쉽게
                </div>
                <div className="w-auto text-2xl xl:text-4xl font-bold mt-5 hidden lg:block">
                  나만의 시험지를 만들 수 있다니, 대박!
                </div>
                <div className="w-auto text-lg mt-3 xl:text-2xl font-medium hidden lg:block">
                  다양한 형식의 퀴즈도 알아서 관리하고,
                </div>
                <div className="w-auto text-lg mt-3 xl:text-2xl font-medium hidden lg:block">
                  내가 만든 퀴즈로 공부하는 재미는 두 배가 될 거예요!
                </div>
                <div className="flex justify-center mt-[2vh] w-full">
                  <button
                    className="flex justify-center font-baloo bg-blue-600 font-black text-white rounded-full w-full shadow-md shadow-gray-400 text-xl lg:mt-[2vh] lg:text-3xl lg:w-72 lg:h-16"
                    onClick={openModal}
                  >
                    PDF Upload
                  </button>
                </div>
              </div>
              <img
                src={center_image}
                alt="중앙이미지"
                className="lg:w-[30vw] lg:h-[30vh] xl:w-[30vw] xl:h-[45vh] hidden lg:block"
              />
            </div>
            <div className="flex flex-col lg:h-[45vh] lg:mt-[5vh] mt-[2vh] w-full">
              <div className="flex justify-between items-center border-b-2 border-gray-300 border-dashed">
                <div className="text-gray-500 font-baloo lg:text-[2vw] text-[5vw] font-bold">
                  Quiz List
                </div>
                <button
                  onClick={toggleDropdown}
                  className="focus:outline-none bg-transparent p-1 lg:hidden"
                >
                  {showDropdown ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 font-bold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 font-bold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <div
                className={`transition-all duration-300 overflow-hidden lg:max-h-full ${
                  showDropdown ? "max-h-full" : "max-h-0"
                }`}
              >
                <div className="flex flex-col lg:flex-row items-center lg:justify-between mt-[2vh]">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-[80vw] h-[4vh] text-[3vw] p-2 border border-gray-300 rounded-full lg:p-3 lg:w-[40vw] lg:h-[4vh] lg:text-[1.5vw]"
                    />
                  </div>
                  <div className="flex lg:items-center">
                    <button
                      className="lg:text-[1vw] text-[3vw] text-gray-500 font-bold bg-transparent lg:p-[0.5vw]"
                      onClick={() => setShowFolderModal(true)}
                    >
                      폴더추가
                    </button>
                    <button
                      className="lg:text-[1vw] text-[3vw] text-gray-500 font-bold bg-transparent lg:p-[0.5vw]"
                      onClick={() => openActionModal("move")}
                    >
                      이동
                    </button>
                    <button
                      className="lg:text-[1vw] text-[3vw] text-gray-500 font-bold bg-transparent lg:p-[0.5vw]"
                      onClick={() => openActionModal("edit")}
                    >
                      수정
                    </button>
                    <button
                      className="lg:text-[1vw] text-[3vw] text-gray-500 font-bold bg-transparent lg:p-[0.5vw]"
                      onClick={() => openActionModal("delete")}
                    >
                      삭제
                    </button>
                    <button
                      className="lg:text-[1vw] text-[3vw] text-gray-500 font-bold bg-transparent lg:p-[0.5vw]"
                      onClick={handleResetClick}
                    >
                      뒤로
                    </button>
                    <button className="lg:text-[1vw] text-[3vw] text-gray-500 font-bold bg-transparent lg:p-[0.5vw]">
                      도움말
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-[2vh] overflow-y-auto h-[30vh] lg:mx-7 lg:justify-start lg:px-10">
                  {[...folders, ...filteredQuizzes]
                    .filter((item) =>
                      "name" in item
                        ? item.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        : item.title
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                    )
                    .map((item) =>
                      "name" in item ? (
                        // 폴더 버튼
                        !selectedFolder && (
                          <button
                            key={item.id}
                            className="relative flex items-center border w-full mx-[6vw] h-[5vh] border-gray-300 rounded-lg bg-blue-100 lg:items-start lg:flex-col lg:p-2 lg:mx-[0vw] lg:w-[14vw] lg:h-24"
                            onClick={() => handleFolderClick(item.id)}
                          >
                            <div className="hidden lg:block absolute top-0 right-0 mt-1 mr-1">
                              <img
                                src={star_gray}
                                alt="즐겨찾기x"
                                className="w-[1.2vw] h-[1.2vw]"
                              />
                            </div>
                            <div className="text-left font-bold text-sm lg:text-[1vw] bg-transparent lg:ml-[1.2vw] lg:mt-[1vh] text-ellipsis w-[140px] lg:w-[100px] xl:w-[150px]">
                              {item.name}
                            </div>
                          </button>
                        )
                      ) : (
                        // 퀴즈 버튼
                        <button
                          key={item.id}
                          className="relative flex flex-row items-center border border-gray-300 rounded-lg bg-white mx-[6vw] w-full h-[5vh] lg:items-start lg:flex-col lg:mx-[0vw] lg:p-1 lg:w-[14vw] lg:h-24"
                          onClick={() =>
                            navigate("/listAnswer", {
                              state: { examId: item.id },
                            })
                          }
                        >
                          <div className="hidden lg:block absolute top-0 right-0 mt-1 mr-1">
                            <img
                              src={star_gray}
                              alt="즐겨찾기x"
                              className="w-[1.2vw] h-[1.2vw]"
                            />
                          </div>
                          <div className="flex flex-row items-center justify-between w-full lg:items-start lg:flex-col lg:mt-[1vh]">
                            <div className="text-left font-bold text-sm lg:text-[1vw] bg-transparent lg:ml-[1.2vw] text-ellipsis w-[140px] lg:w-[100px] xl:w-[150px]]">
                              {item.title}
                            </div>
                            <div className=" flex flex-row justify-end text-gray-500 text-sm lg:mt-7 lg:text-[1vw] lg:justify-between lg:mx-[1.2vw]">
                              <div className="lg:mr-[1vw]">
                                {formatDate(item.examDate)}
                              </div>
                              <div className="xl:ml-[1vw] hidden lg:block">
                                19/25
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    )}
                </div>
              </div>
              {/* 폴더 생성 모달 */}
              {showFolderModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg flex flex-col items-center">
                    <div className="font-bold text-[5vw] mb-[2vh] lg:text-[1.5vw]">
                      폴더생성
                    </div>
                    <img
                      src={folderImage}
                      alt="폴더"
                      className="w-24 h-24 mb-4"
                    />
                    <input
                      type="text"
                      placeholder="폴더 이름을 입력하세요"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="border border-gray-300 p-2 rounded mb-4 text-center"
                    />
                    <div className="flex space-x-4">
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={handleFolderCreate}
                      >
                        생성
                      </button>
                      <button
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                        onClick={() => setShowFolderModal(false)}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col my-[5vh] w-full lg:h-[30vh] lg:my-[5vh]">
              <div className="text-gray-500 text-[5vw] font-baloo font-bold border-b-2 border-gray-300 border-dashed lg:text-[2vw]">
                Calender
              </div>
              {/* 캘린더 */}
              <div className="relative flex-grow justify-center w-full h-full mt-[2vh]">
                <div className="flex flex-col lg:flex-row justify-between">
                  <div className="grid grid-cols-7 w-full ml-[1vw] lg:w-[28.58vw] lg:h-[19.17vh] lg:ml-[6vw]">
                    {selectedMonth !== null &&
                      createCalendarSquares(months[selectedMonth].days)}
                  </div>
                  <div className="grid grid-cols-6 my-[4vh] bg-gray-100 rounded-lg p-2 lg:grid-cols-2 lg:my-[0vh] lg:p-0 lg:bg-white">
                    {months.map((month, index) => (
                      <button
                        key={index}
                        className={`px-1 py-1 text-base rounded font-bold ${
                          selectedMonth === index
                            ? "bg-blue-600 text-white font-bold rounded-lg"
                            : "bg-transparent text-gray-500 font-bold"
                        }`}
                        onClick={() => setSelectedMonth(index)}
                      >
                        {month.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-row justify-center lg:flex-col lg:justify-start lg:items-end lg:mr-[5vw]">
                    <div className="text-blue-600 font-bold text-[4vw] mx-[3vw] lg:mx-[0vw] lg:text-[1vw] lg:text-gray-500">
                      TOTAL : 0
                    </div>
                    <div className="text-blue-600 font-bold text-[4vw] mx-[3vw] lg:mx-[0vw] lg:text-[1vw] lg:text-gray-500">
                      COUNT : 0
                    </div>
                    {/* <div className="text-blue-600 font-bold text-[4vw] mx-[3vw] lg:mx-[0vw] lg:text-[1vw] lg:text-gray-500">
                                            RANK : C
                                        </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
      <Upload showModal={showModal} closeModal={closeModal} />
      {showActionModal && (
        <ActionModal
          items={
            modalMode === "move"
              ? items.filter((item) => "title" in item)
              : items
          }
          onClose={closeActionModal}
          mode={modalMode}
          onDelete={handleDelete}
          folders={folders}
          setQuiz={setQuiz}
          setFolders={setFolders}
        />
      )}
    </div>
  );
}

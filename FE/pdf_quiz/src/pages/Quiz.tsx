import { useState, useEffect } from "react";
import timerImage from "../assets/timer.png";
import Timer from "../Hooks/Timer";
import OMR from "../Hooks/OMR";
import SubmitCheck from "../Modal/Submit";
import QuizData from "./QuizData";
import { useQuizContext } from "../context/QuizContext";
import UserAnswers from "../Hooks/userAnswers";

const Quiz = () => {
  const [showModal, setShowModal] = useState(false); // 모달
  const [isScreenSmall, setIsScreenSmall] = useState(false); // 화면 크기 상태
  const [page, setPage] = useState(1); // 페이지 상태 추가
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수 상태 추가
  const itemsPerPage = 5;

  const { quizCount, optionCount, timeLimitHour, timeLimitMinute } =
    useQuizContext();
  const { handleOptionClick, uncompletedCount } = UserAnswers();

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  // const [startTime, setStartTime] = useState<number | null>(null);
  const { title, setElapsedTime } = useQuizContext();

  const [startTime] = useState(Date.now()); // 상태로 설정하지 않고 한 번만 설정되도록

  useEffect(() => {
    // 매 초마다 경과 시간 계산
    const intervalId = setInterval(() => {
      const now = Date.now();
      const timeDiff = now - startTime;

      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      // 경과 시간을 QuizContext에 저장
      setElapsedTime({ hours, minutes, seconds });
    }, 1000); // 1초마다 업데이트

    // 컴포넌트 언마운트 시 interval 정리
    return () => clearInterval(intervalId);
  }, [startTime, setElapsedTime]);

  const handleResize = () => {
    // 화면 크기가 860px 이하인지 확인
    setIsScreenSmall(window.innerWidth < 860);
  };

  useEffect(() => {
    // 컴포넌트가 마운트될 때 이벤트 리스너 추가
    window.addEventListener("resize", handleResize);
    handleResize(); // 초기 확인

    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleNextPage = () => {
    if (page < totalPages) setPage((prevPage) => prevPage + 1);
    if (page === totalPages) {
      alert("마지막 페이지입니다.");
    }
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((prevPage) => prevPage - 1);
    if (page === 1) {
      alert("첫 페이지입니다.");
    }
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col overflow-x-hidden min-w-[860px]">
      {isScreenSmall && (
        <div className="bg-red-500 text-white text-center p-2">
          이 크기보다 더 줄이시면 최적화된 화면을 보기 어렵습니다.
        </div>
      )}
      <div className="h-16 flex flex-row justify-center font-body ">
        {/* 사용자가 입력한 제목 or pdf 파일 제목 그대로 받아와서 띄워주기 */}
        <div className="w-4/5 flex flex-start items-center bg-gray-100 pl-7 border-r border-b border-gray-400">
          {title}
        </div>
        {/* 사용자가 입력한 시간  */}
        <div className="w-1/5 max-lg:w-[25%] min-w-0 flex flex-row gap-4 justify-center items-center text-center border-b border-gray-400">
          <img
            src={timerImage}
            alt="clock"
            className="w-8 h-8 max-lg:w-6 max-lg:h-6"
          />
          <div className="flex flex-col justify-center items-center ">
            <div className="flex flex-row gap-2 max-lg:text-sm ">
              <div>제한 시간 </div>
              <div>
                {timeLimitHour.toString().padStart(2, "0")}:
                {timeLimitMinute.toString().padStart(2, "0")}:00
              </div>
            </div>
            <div className="flex flex-row gap-2 max-lg:text-sm">
              <div>남은 시간 </div>
              <div>
                <Timer hour={timeLimitHour} minute={timeLimitMinute} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-14 flex flex-row justify-center font-body">
        {/* 후에 옵션이 추가될 것을 고려하여 남겨둠 / 전체 문제 및 안푼 문제 띄우기 */}
        <div className="w-4/5 flex justify-center items-center border-r border-b border-gray-400">
          <div className="w-2/3 ml-5 left_container">
            <div className=" flex font-bold max-lg:text-m whitespace-nowrap">
              * 문제는 한 번에 5개씩 표시되어 모든 문제를 불러오는데 시간이
              소요됩니다.
            </div>
          </div>

          <div className="w-1/3 flex flex-col gap-1">
            <div className="flex justify-end flex-col">
              <div className=" flex max-lg:text-m whitespace-nowrap">
                전체 문제: {quizCount}개
              </div>
              <div className="flex max-lg:text-m whitespace-nowrap">
                <div>남은 문제: {uncompletedCount}개 </div>
              </div>
            </div>
          </div>
          <div className="h-[3px] bg-gray-300 mx-4"></div>
        </div>
        <div className="w-1/5 max-lg:w-[25%] min-w-0 flex justify-center items-center text-lg bg-blue-200 max-lg:text-m border-b border-gray-400">
          답안 OMR
        </div>
      </div>

      <div className="h-4/5 flex flex-row pt-2">
        <div className="w-4/5 flex-shrink flex-grow flex font-body overflow-auto border-r border-gray-400">
          <QuizData
            page={page}
            itemsPerPage={itemsPerPage}
            setPage={setPage}
            setTotalPages={setTotalPages}
          />
          {/* 페이지 관련 props 전달 */}
        </div>
        {/* OMR 부분이 항상 보이도록 유지 */}
        <div className="w-1/5 max-lg:w-[25%] min-w-0 overflow-scroll">
          <OMR
            quizCount={quizCount}
            optionCount={optionCount}
            // answerList={answerList}
            handleOptionClick={handleOptionClick}
          />
        </div>
      </div>
      <div className="font-body flex-grow flex flex-row justify-center">
        <div className="w-4/5 flex-grow flex justify-center gap-5 items-center bg-gray-100 border-t border-gray-400">
          <button
            className="rounded-3xl bg-white border-black"
            onClick={handlePrevPage}
          >
            이전
          </button>
          <div>
            {page}/{totalPages}
          </div>
          <button
            className="rounded-3xl bg-white border-black"
            onClick={handleNextPage}
          >
            다음
          </button>
        </div>
        <div className="w-1/5 max-lg:w-[25%] min-w-0 flex justify-center items-center">
          <button
            className="w-full h-full text-lg flex justify-center items-center bg-blue-600 text-white "
            onClick={openModal}
          >
            제출하기
          </button>
        </div>
      </div>
      <SubmitCheck
        showModal={showModal}
        closeModal={closeModal}
        // answerList={answerList}
        uncompletedCount={uncompletedCount}
      />
    </div>
  );
};

export default Quiz;

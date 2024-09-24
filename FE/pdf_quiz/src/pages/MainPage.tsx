import Header from "../components/Header";
import MainIcon from "../assets/MainIcon.svg";
import { useNavigate } from "react-router-dom";
const MainPage = () => {
  const navigate = useNavigate();

  const NavigateToLogin = () => {
    navigate("/login");
  };
  return (
    <div className="w-screen min-h-screen">
      <Header />
      <div className="w-full items-center justify-center flex flex-col-reverse md:flex-row  space-x-4 md:space-x-10">
        <div className="w-1/2 flex flex-col min-w-[500px] items-center justify-center text-center p-3 md:ml-10  ">
          <div className="w-full text-2xl sm:text-4xl font-bold mt-5 md:mt-10 whitespace-nowrap  transition-all duration-700 ease-in-out">
            내가 정리한 PDF를 업로드하고,
          </div>
          <div className="w-full text-2xl sm:text-4xl font-bold whitespace-nowrap transition-all duration-700 ease-in-out">
            시험지를 만들어보세요!
          </div>
          <div className="w-full text-sm sm:text-2xl mt-4 md:mt-8 whitespace-nowrap  transition-all duration-700 ease-in-out">
            QuizGen에서는 시험지 만들기 뿐만 아니라,
          </div>
          <div className=" text-sm sm:text-2xl whitespace-nowrap  transition-all duration-700 ease-in-out">
            실제 CBT (Computer Based Test) 와 유사한 환경에서
          </div>
          <div className="w-full text-sm sm:text-2xl whitespace-nowrap  transition-all duration-700 ease-in-out">
            문제를 풀어볼 수 있습니다
          </div>
          <button
            className="w-48 h-12 text-md md:w-60 md:h-24 md:text-2xl h-200px bg-blue-600 text-white rounded-full px-5 py-2 mt-5 md:mt-10"
            onClick={NavigateToLogin}
          >
            시험지 만들어 보기
          </button>
        </div>
        <div className="w-1/2  md:1/2 h-2/3 flex justify-center m:justify-end mt-10 md:mt-20">
          <img src={MainIcon} className="min-w-[300px] md:min-w-[400px]" />
        </div>
      </div>
    </div>
  );
};
export default MainPage;

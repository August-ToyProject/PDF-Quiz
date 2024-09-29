import BlueLogo from "../assets/Logo_blue.svg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [clicked, Setcliked] = useState(false);
  const navigate = useNavigate();

  const NavigateToMain = () => {
    Setcliked(true);
    navigate("/");
  };

  const NavigateToLogin = () => {
    navigate("/login");
  };

  const HandleClicked = () => {
    if (clicked) {
      Setcliked(true);
    }
  };

  return (
    <div className="w-full h-[60px] border-b-2 border-gray-300 relative flex items-center px-3">
      <img
        src={BlueLogo}
        alt="Quizgen"
        className="w-24 lg:w-36 lg:h-14 lg:ml-5"
      />
      {/* lg:ml-0 lg:relative lg:left-auto lg:transform-none absolute left-1/2 transform -translate-x-1/2 lg:static" */}

      {/* 작은 화면일 경우 (반응형) */}
      <div className="flex my-4 items-center space-x-1lg:space-x-6 ml-auto pl-4">
        <button
          className={`font-header font-bold text-sm lg:text-lg bg-transparent ${
            clicked ? "text-blue-500" : "text-black" // clicked가 true일 때 색상 변경
          }`}
          onClick={NavigateToMain}
        >
          Home
        </button>
        <a
          href="https://junyong1111.notion.site/QuizGen-10d8821add1580938780d33e889994ea?pvs=4"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button
            className={`font-header font-bold text-sm lg:text-lg bg-transparent ${
              clicked ? "text-blue-500" : "text-black" // clicked가 true일 때 색상 변경
            }`}
            onClick={HandleClicked}
          >
            Help
          </button>
        </a>
        <button
          className="font-header text-m bg-blue-600 text-sm lg:text-lg text-white font-bold rounded-full px-5 py-2"
          onClick={NavigateToLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
};
export default Header;

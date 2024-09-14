import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ServiceName from "../assets/Logo.svg";
import ServiceLogo from "../assets/ServiceLogo.png";

const apiUrl = import.meta.env.VITE_NGROK_URL;

interface loginData {
  id: string;
  password: string;
}

const Login = () => {
  const [id, setId] = useState<loginData["id"]>("");
  const [password, setPassword] = useState<loginData["password"]>("");

  // inputData 에 id, password 저장(객체로 전달)
  const [inputData, setInputData] = useState<loginData>({
    id: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<loginData>>({});

  const navigate = useNavigate();

  //아이디, 비밀번호 빈 값 유효성 검사
  const validate = (): Partial<loginData> => {
    const inputError: Partial<loginData> = {};
    if (id === "") {
      inputError.id = "아이디를 입력해주세요";
    }
    if (password === "") {
      inputError.password = "비밀번호를 입력해주세요";
    }
    return inputError;
  };
  //로그인 버튼 클릭시 실행

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    const requestData = {
      userId: inputData.id,
      password: inputData.password,
    };

    try {
      //URL 변경 예정
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      if (!response.ok) {
        throw new Error("로그인에 실패했습니다");
      }
      const accessToken = response.headers
        .get("Authorization")
        ?.replace("Bearer ", "");

      //accesstoken 저장
      if (accessToken) {
        localStorage.setItem("accesstoken", accessToken);
        navigateToMyPage();
      } else {
        alert("아이디 또는 비밀번호가 틀렸습니다.");
      }
    } catch (error) {
      console.error("Error during login:, ", error);
    }
  };

  //아이디, 비밀번호 입력값 업데이트
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "id") {
      setId(value);
      setInputData((prev) => ({ ...prev, id: value }));
    } else if (name === "password") {
      setPassword(value);
      setInputData((prev) => ({ ...prev, password: value }));
    }
  };

  //회원가입 버튼 누르면 회원가입 페이지로 이동
  const navigateToSignUp = () => {
    navigate("/signup");
  };

  //로그인 버튼 누르면 마이페이지 페이지로 이동
  const navigateToMyPage = () => {
    navigate("/mypage");
  };

  // 아이디 비밀번호 찾기 페이지로 이동
  const navigateToFindIDPW = () => {
    navigate("/findAccount");
  };

  return (
    <div className="w-full h-screen grid grid-cols-3">
      <div className="col-span-1 bg-blue-600 flex flex-col gap-7 justify-center items-center">
        <img src={ServiceName} alt="logo" className="w-60" />
        <img src={ServiceLogo} alt="pdf" className="w-60" />
      </div>
      <div className="col-span-2 h-screen  flex flex-col justify-center items-center bg-white">
        <div className="font-title text-5xl text-blue-600 font-black mb-8 tracking-wide">
          Login
        </div>
        <form
          className="w-4/5 flex flex-col gap-4 max-w-2xl"
          onSubmit={handleLogin}
        >
          <label className="w-full flex flex-row justify-center gap-2 items-center">
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded"
              name="id"
              value={id}
              placeholder="아이디"
              onChange={handleChange}
            />
          </label>

          {errors.id && (
            <p className="text-red-500 text-sm">아이디를 입력해주세요</p>
          )}

          <label className="w-full flex flex-row justify-center gap-2 items-center">
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded"
              name="password"
              value={password}
              placeholder="비밀번호"
              onChange={handleChange}
            />
          </label>

          {errors.password && (
            <p className="text-red-500 text-sm">비밀번호를 입력해주세요</p>
          )}

          <div className="w-full flex flex-row gap-7 justify-center">
            <a className="bg-white cursor-pointer" onClick={navigateToFindIDPW}>
              아이디/비밀번호 찾기
            </a>
            <a className="bg-white cursor-pointer" onClick={navigateToSignUp}>
              회원가입
            </a>
          </div>
          <div className="w-full flex justify-center">
            <button
              className="p-2 bg-blue-600 text-white font-black rounded"
              type="submit"
            >
              로그인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

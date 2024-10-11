import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser, emailAuth, emailAuthCheck } from "../api/ApiUser";
import AgreementModal from "../Modal/agreementModal";
import Header from "../components/Header";

interface InputData {
  name: string;
  email: string;
  emailCheck: string;
  nickname: string;
  id: string;
  password: string;
  confirmPassword: string;
}

export default function SignUp() {
  // 초기화
  const [inputData, setInputData] = useState<InputData>({
    name: "",
    email: "",
    emailCheck: "",
    nickname: "",
    id: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<
    Partial<InputData> & { agreement?: string }
  >({});
  const [showAgreementModal, SetShowAgreementModal] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [emailSent, setEmailSent] = useState(false); 
  const [emailCheck, setEmailCheck] = useState(false); 
  const navigate = useNavigate();

  // 입력 필드
  const fields = [
    { label: "이름", 
      placeholder: "name",
      key: "name", 
      marginRight: "10rem" 
    },
    {
      label: "이메일",
      placeholder: "email",
      key: "email",
      marginRight: "9.5rem",
    },
    {
      label: "이메일 인증 확인",
      placeholder: "emailCheck",
      key: "emailCheck",
      marginRight: "9.5rem",
    },
    {
      label: "닉네임",
      placeholder: "nickname",
      key: "nickname",
      marginRight: "9.5rem",
    },
    { label: "아이디", placeholder: "id", key: "id", marginRight: "9.5rem" },
    {
      label: "비밀번호",
      placeholder: "password",
      key: "password",
      marginRight: "9rem",
    },
    {
      label: "비밀번호 확인",
      placeholder: "confirmPassword",
      key: "confirmPassword",
      marginRight: "7.5rem",
    },
  ];

  // 입력 값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value });
  };

  // 유효성 검사
  const validate = (): Partial<InputData & { agreement: string }> => {
    const inputError: Partial<InputData & { agreement: string }> = {};
    // 이름 형식 제한
    if (!/^[가-힣]*$/.test(inputData.name)) {
      inputError.name = "이름은 한글만 입력 가능합니다.";
    }
    // 이름 길이 제한
    if (inputData.name.length < 2 || inputData.name.length > 6) {
      inputError.name = "이름은 최소 2자에서 최대 6자여야 합니다.";
    }
    // 이메일 형식 제한
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(inputData.email)) {
      inputError.email = "유효한 이메일 주소를 입력하세요.";
    }
    // 닉네임 길이 제한
    if (inputData.nickname.length < 4 || inputData.nickname.length > 20) {
      inputError.nickname = "닉네임은 최소 4자에서 최대 20자여야 합니다.";
    }
    // 아이디 형식 제한
    if (!/^[a-zA-Z0-9]*$/.test(inputData.id)) {
      inputError.id = "아이디는 영어 또는 영어와 숫자만 가능합니다.";
    }
    // 아이디 길이 제한
    if (inputData.id.length < 4 || inputData.id.length > 20) {
      inputError.id = "아이디는 최소 4자에서 최대 20자여야 합니다.";
    }
    // 비밀번호 형식 및 길이 제한
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(inputData.password)) {
      inputError.password =
        "비밀번호는 최소 8자 이상이어야 하며, 영어와 숫자를 포함해야 합니다.";
    }
    // 비밀번호 일치 확인
    if (inputData.password !== inputData.confirmPassword) {
      inputError.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }
    // 개인정보 수집/이용 동의 체크 여부 확인
    if (!agreementChecked) {
      inputError.agreement = "개인정보 수집 및 이용에 동의하셔야 합니다.";
    }
    return inputError;
  };

  // 이메일 인증 요청
  const handleEmailAuth = async () => {
    const validationErrors = validate();
  
    // 유효성 검사에서 이메일에 오류가 있으면 인증 요청을 보내지 않음
  if (validationErrors.email) {
    setErrors((prevErrors) => ({
      ...prevErrors,
      email: validationErrors.email,
    }));
    return;
  }
    const requestData = {
      email: inputData.email,
    };
    try {
      await emailAuth(requestData); 
      setEmailSent(true); 
      alert("인증 코드가 이메일로 전송되었습니다.");
    } catch (error) {
      console.error("이메일 인증 오류:", error);
      alert("이메일 인증에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 이메일 인증 확인 요청
  const handleEmailAuthCheck = async () => {
    const requestData = {
      email: inputData.email,
      emailCheck: inputData.emailCheck,
    };
    // console.log(requestData.email, requestData.emailCheck);

    if (!inputData.emailCheck) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        emailCheck: "인증 코드를 입력하세요.",
      }));
      return;
    }

    try {
      const response = await emailAuthCheck(requestData);
      console.log(response);
      if (response.result === true) {
        setEmailCheck(true);
        alert("이메일 인증이 성공적으로 완료되었습니다.");
      } else {
        setEmailCheck(false);
        alert("인증 번호가 올바르지 않습니다. 다시 확인해주세요.");
      }
    }catch (error) {
      console.error("이메일 인증 확인 오류:", error);
      alert("이메일 인증에 실패했습니다. 인증 번호를 다시 확인해주세요.");
    }
  };

  // 데이터 통신
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!emailCheck) {
      alert("이메일 인증이 완료되지 않았습니다. 인증을 완료해주세요.");
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const requestData = {
      userId: inputData.id,
      email: inputData.email,
      emailCheck: inputData.emailCheck,
      username: inputData.name,
      nickname: inputData.nickname,
      password: inputData.password,
      passwordConfirm: inputData.confirmPassword,
    };

    try {
      await signupUser(requestData);
      setErrors({});
      console.log("회원가입이 성공적으로 완료되었습니다.");
      navigate("/login"); // 회원가입 성공 후 로그인 페이지로 이동
    } catch (error) {
      console.error("네트워크 오류:", error);
    }
  };

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <Header/>
      <div className="font-title text-3xl text-blue-600 font-black mb-8 tracking-wide mt-[6vh] lg:mt-[12vh] lg:text-5xl">
        SignUp
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 w-full max-w-2xl mt-10 md:max-w-xl lg:max-w-sm"
      >
        {fields.map((field, index) => (
          <div key={index} className="flex flex-col items-start mx-[15vw] lg:mx-[0vw]">
             <label htmlFor={field.key} className="text-sm text-gray-400 font-bold mb-1 ml-2">
              {field.label}
            </label>
            <div className="flex items-center w-full border border-gray-300 rounded-full">
              <input
                type={
                  field.key === "password" || field.key === "confirmPassword"
                    ? "password"
                    : "text"
                }
                name={field.key}
                value={inputData[field.key as keyof InputData] || ""}
                onChange={handleChange}
                className="flex-grow p-2 rounded-full"
              />
              {/* 이메일 필드일 때 버튼 렌더링 */}
              {field.key === "email" && (
                <button
                  type="button"
                  className={`text-sm font-bold border-2 border-blue-600 px-4 md:py-1 md:mr-2 rounded-full ${emailSent ? "bg-blue-600 text-white" : "text-blue-600 bg-gray-100"}`}
                  onClick={handleEmailAuth}
                >
                  {emailSent ? "재전송" : "인증"}
                </button>
              )}
              {/* 이메일 인증 필드일 때 버튼 렌더링 */}
              {field.key === "emailCheck" && (
                <button
                  type="button"
                  className={`text-sm font-bold border-2 border-blue-600 px-4 md:py-1 md:mr-2 rounded-full ${emailCheck ? "bg-blue-600 text-white" : "text-blue-600 bg-gray-100"}`}
                  onClick={handleEmailAuthCheck}
                >
                  {emailCheck ? "완료" : "확인"}
                </button>
              )}
              {/* 아이디 필드일 때 버튼 렌더링 */}
              {/* {field.key === "id" && (
                <button
                  type="button"
                  className="text-sm text-blue-600 bg-gray-100 font-bold border-2 border-blue-600 px-4 md:py-1 md:mr-2 rounded-full"
                  onClick={() => {
                    console.log("아이디 중복 확인 버튼 클릭됨");
                  }}
                >
                  완료
                </button>
              )} */}
            </div>
            {errors[field.key as keyof InputData] && (
              <div className="text-red-500 text-xs mt-1">
                {errors[field.key as keyof InputData]}
              </div>
            )}
          </div>
        ))}
        <div className="col-span-2 flex flex-col justify-center items-center">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600"
              checked={agreementChecked}
              onChange={() => setAgreementChecked(!agreementChecked)}
            />
            <div className="font-bold text-base text-red-600">
              [필수]개인정보 수집/이용 동의
            </div>
            <button
              type="button"
              className="font-bold text-sm text-gray-400 p-1 bg-transparent"
              onClick={() => SetShowAgreementModal(true)}
            >
              약관보기
            </button>
          </div>
          {errors.agreement && (
            <div className="text-red-500 text-xs mt-1">{errors.agreement}</div>
          )}
          <button
            type="submit"
            className="p-3 bg-blue-600 text-white border font-black rounded-full w-[70vw] sm:w-[35vw] lg:w-[15vw] my-4"
          >
            회원가입
          </button>
        </div>
      </form>
      {showAgreementModal && (
        <AgreementModal
          showModal={showAgreementModal}
          closeModal={() => SetShowAgreementModal(false)} // 모달 닫기 함수
        />
      )}
    </div>
  );
}

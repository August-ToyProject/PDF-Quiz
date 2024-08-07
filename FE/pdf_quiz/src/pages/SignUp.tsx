import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


interface InputData {
  name: string;
  email: string;
  nickname: string;
  id: string;
  password: string;
  confirmPassword: string;
}

export default function SignUp() {
  // 초기화
  const [inputData, setInputData] = useState<InputData>({
    name : '',
    email : '',
    nickname : '',
    id : '',
    password : '',
    confirmPassword : '',
  })

  const [testDB, setTestDB] = useState<InputData[]>([]);
  const [errors, setErrors] = useState<Partial<InputData>>({});

  const navigate = useNavigate();

  // 입력 필드
  const fields = [
    { label: "이름", placeholder: "name", key: "name", marginRight: "10rem" },
    { label: "이메일", placeholder: "e-mail", key: "email", marginRight: "9.5rem" },
    { label: "닉네임", placeholder: "nickname", key: "nickname", marginRight: "9.5rem" },
    { label: "아이디", placeholder: "id", key: "id", marginRight: "9.5rem" },
    { label: "비밀번호", placeholder: "password", key: "password", marginRight: "9rem" },
    { label: "비밀번호 확인", placeholder: "confirmPassword", key: "confirmPassword", marginRight: "7.5rem" },
  ];

  // 입력 값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value });
  };

  // 유효성 검사
  const validate = (): Partial<InputData> => {
    const inputError: Partial<InputData> = {};
    // 이름 한글 제한
    if (!/^[가-힣]*$/.test(inputData.name)) {
      inputError.name = '이름은 한글만 입력 가능합니다.';
    }
    // 이메일 형식 제한
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(inputData.email)) {
      inputError.email = '유효한 이메일 주소를 입력하세요.';
    }
    // 아이디 형식 제한
    if (!/^[a-zA-Z0-9]*$/.test(inputData.id)) {
      inputError.id = '아이디는 영어 또는 영어와 숫자만 가능합니다.';
    }
    // 비밀번호 일치 확인
    if (inputData.password !== inputData.confirmPassword) {
      inputError.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    return inputError;
  };

  // 데이터 제출
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setTestDB([...testDB, inputData]);
    console.log('testDB : ', [...testDB, inputData]);
    setErrors({});
  };

  //회원가입 버튼 누르면 회원가입 페이지로 이동
  const navigateToLogin = () => {
    navigate('/')
}

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center bg-white">
      <button className="absolute top-2 right-4 p-2 text-blue-600 bg-transparent"
              onClick={navigateToLogin}>
        Login
      </button>
      <div className="text-4xl text-blue-600 font-black mb-8">
        SignUp
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 w-full max-w-2xl">
        {fields.map((field, index) => (
          <div key={index} className="flex flex-col items-start">
            <div className="text-xs text-stone-400 font-black mb-1" style={{ marginRight: field.marginRight }}>
              {field.label}
            </div>
            <input
              type={field.key === 'password' || field.key === 'confirmPassword' ? 'password' : 'text'}
              name={field.key}
              value={inputData[field.key as keyof InputData] || ''}
              onChange={handleChange}
              className="mb-4 p-2 border border-gray-300 rounded w-full"
              placeholder={field.placeholder}
            />
            {errors[field.key as keyof InputData] && (
              <div className="text-red-500 text-xs mt-1">
                {errors[field.key as keyof InputData]}
              </div>
            )}
          </div>
        ))}
        <div className="col-span-2 flex justify-center">
          <button type="submit" className="p-2 bg-blue-600 text-white border rounded-tr-lg mt-4">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

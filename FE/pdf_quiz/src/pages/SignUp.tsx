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

  const apiBaseUrl = 'http://43.201.129.54:8080/api/v1/sign-up'; 

  // const [testDB, setTestDB] = useState<InputData[]>([]);
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
    // 이름 형식 제한
    if (!/^[가-힣]*$/.test(inputData.name)) {
      inputError.name = '이름은 한글만 입력 가능합니다.';
    }
    // 이름 길이 제한
    if (inputData.name.length < 2 || inputData.name.length > 6) {
      inputError.name = '이름은 최소 2자에서 최대 6자여야 합니다.';
    }
    // 이메일 형식 제한
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(inputData.email)) {
      inputError.email = '유효한 이메일 주소를 입력하세요.';
    }
    // 닉네임 길이 제한
    if (inputData.nickname.length < 4 || inputData.nickname.length > 20) {
      inputError.nickname = '닉네임은 최소 4자에서 최대 20자여야 합니다.';
    }
    // 아이디 형식 제한
    if (!/^[a-zA-Z0-9]*$/.test(inputData.id)) {
      inputError.id = '아이디는 영어 또는 영어와 숫자만 가능합니다.';
    }
    // 아이디 길이 제한
    if (inputData.id.length < 4 || inputData.id.length > 20) {
      inputError.id = '아이디는 최소 4자에서 최대 20자여야 합니다.';
    }
    // 비밀번호 형식 및 길이 제한
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(inputData.password)) {
      inputError.password = '비밀번호는 최소 8자 이상이어야 하며, 영어와 숫자를 포함해야 합니다.';
    }
    // 비밀번호 일치 확인
    if (inputData.password !== inputData.confirmPassword) {
      inputError.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    return inputError;
  };

  // 데이터 통신
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    const requestData = {
      userId: inputData.id,
      email: inputData.email,
      username: inputData.name,
      nickname: inputData.nickname,
      password: inputData.password,
      passwordConfirm: inputData.confirmPassword
    };
    
    try {
      const response = await fetch(apiBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
  
      if (response.ok) {
        console.log('회원가입 성공:', await response.json());
        console.log('응답 상태 코드:', response.status);
        setErrors({});
        navigate('/'); // 회원가입 성공 후 로그인 페이지로 이동
      } else {
        const errorData = await response.json();
        console.error('회원가입 실패:', errorData);
        // setErrors({ id: '회원가입에 실패했습니다. 다시 시도해주세요.' });
      }
    } catch (error) {
      console.error('네트워크 오류:', error);
      // setErrors({ id: '네트워크 오류가 발생했습니다. 다시 시도해주세요.' });
    }
  };

    //로그인 버튼 누르면 회원가입 페이지로 이동
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

import { useEffect, useState } from 'react';
import { infoUser, updateInfo, updatePassword } from '../api/ApiUser';
import { useNavigate } from 'react-router-dom';

interface UserInfo{
    userId: string;
    email: string;
    username: string;
    nickname: string;
    password?: string;
    passwordConfirm?: string;
}

export default function InfoPage() {
    const [userData, setUserData] = useState<UserInfo | null>(null);
    const [activeButton, setActiveButton] = useState('info');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [errors, setErrors] = useState<Partial<UserInfo & { password: string; passwordConfirm: string; }>>({});
    const commonClassNames = "bg-white rounded-lg border border-gray-300 p-2 m-2 w-full";

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accesstoken');
    
        if (!token) {
            console.log('토큰이 없습니다. 로그인 페이지로 이동해야 합니다.');
        } else {
            console.log('토큰이 존재합니다:', token);
        }
        if(activeButton === 'info'){
            infoUser()
                .then(data => {
                    setUserData(data);
                })
                .catch(error => {
                    console.log('유저 정보 가져오기 실패', error);
                })
        }
    }, [activeButton]);

    const handleExit = () => {
        navigate('/mypage');
    }

    const handleInfoChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData(prevData => prevData? {...prevData, [name]: value} : null)
    }

    const handleInfoSave = async () => {
        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }
        if(userData){
            const promises = [];

            promises.push(
                updateInfo(userData)
                    .catch(error => {
                        console.log('정보 수정에 실패하였습니다.');
                        throw new Error('정보 수정에 실패하였습니다.');
                    })
            );
            if(password && passwordConfirm){
                promises.push(
                    updatePassword(userData.email, {password, passwordConfirm})
                        .catch(error => {
                            console.log('비밀번호 수정에 실패하였습니다.');
                            throw new Error('비밀번호 수정에 실패했습니다.');
                        }) 
                )
            }
            try{
                await Promise.all(promises);
                alert('정보 수정에 성공하였습니다.');
                setActiveButton('info');
                setPassword('');
                setPasswordConfirm(''); 
            }catch(error){
                console.log('정보 수정에 실패하였습니다.')
            }
        }
    }

    const [UserInfo, setInputData] = useState<UserInfo>({
        userId : '',
        username : '',
        email : '',
        nickname : '',
      })

    // 유효성 검사
    const validate = (): Partial<UserInfo> => {
        const inputError: Partial<UserInfo> = {};
    
        if (userData) {
            // 이름 형식 제한
            if (!/^[가-힣]*$/.test(userData.username)) {
                inputError.username = '이름은 한글만 입력 가능합니다.';
            }
            // 이름 길이 제한
            if (userData.username.length < 2 || userData.username.length > 6) {
                inputError.username = '이름은 최소 2자에서 최대 6자여야 합니다.';
            } 
            // 이메일 형식 제한
            if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(userData.email)) {
                inputError.email = '유효한 이메일 주소를 입력하세요.';
            }
            // 닉네임 길이 제한
            if (userData.nickname.length < 4 || userData.nickname.length > 20) {
                inputError.nickname = '닉네임은 최소 4자에서 최대 20자여야 합니다.';
            }
        }
        // 비밀번호 형식 및 길이 제한
        if (password && password.length < 8) {
            inputError.password = '비밀번호는 최소 8자 이상이어야 합니다.';
        }
        // 비밀번호 일치 확인
        if (password !== passwordConfirm) {
            inputError.passwordConfirm = '비밀번호가 일치하지 않습니다.';
        }
    
        return inputError;
    };

    return(
        <div className="h-screen w-full flex flex-col justify-start items-center bg-white">
            <div className="text-4xl text-blue-600 font-black mt-16 mb-8">QUIZ GEN</div>
            <div className="bg-white p-4 w-80 flex flex-col justify-start min-h-[400px]">
                <div className="flex justify-center w-full mb-4">
                    <button 
                        className={`bg-white px-4 py-2 rounded-none w-1/2 focus:outline-none ${
                            activeButton === 'info' ? 'border-b-4 border-t-0 border-l-0 border-r-0 border-blue-600 text-blue-600' : 'border-b-2 border-transparent text-gray-400'
                        }`}
                        onClick={() => setActiveButton('info')}
                    >
                        정보
                    </button>
                    <button
                        className={`bg-white px-4 py-2 rounded-none w-1/2 focus:outline-none ${
                            activeButton === 'edit' ? 'border-b-4 border-t-0 border-l-0 border-r-0 border-blue-600 text-blue-600' : 'border-b-2 border-transparent text-gray-400'
                        }`}
                        onClick={() => setActiveButton('edit')}
                    >
                        수정
                    </button>
                </div>
                {activeButton === 'info' ? (
                    <div className='flex flex-col items-start w-full'>
                        <h2 className="text-sm text-gray-600 ml-4 mt-4">이름</h2>
                        <div className={commonClassNames}>
                            <h2 className="text-base font-bold">{userData?.username || 'Loading...'}</h2>
                        </div>
                        <h2 className="text-sm text-gray-600 ml-4">닉네임</h2>
                        <div className={commonClassNames}>
                            <h2 className="text-base font-bold">{userData?.nickname || 'Loading...'}</h2>
                        </div>
                        <h2 className="text-sm text-gray-600 ml-4">이메일</h2>
                        <div className={commonClassNames}>
                            <h2 className="text-base font-bold">{userData?.email || 'Loading...'}</h2>
                        </div>
                        <button 
                            className="broder-2 border-blue-600 text-blue-600 font-bold mt-4 mx-2 w-full hover:bg-blue-600 hover:text-white"
                            onClick={handleExit}
                        >
                            Exit
                        </button>
                    </div>
                    
                ) : (
                    <div className='flex flex-col items-start w-full'>
                        <h2 className="text-sm text-gray-600 ml-4 mt-4">이름</h2>
                        <input
                            type="text"
                            name="username"
                            value={userData?.username || ''}
                            onChange={handleInfoChange}
                            className={commonClassNames}
                        />
                        {errors.username && <p className="ml-4 text-red-500 text-sm">{errors.username}</p>}
                        <h2 className="text-sm text-gray-600 ml-4">닉네임</h2>
                        <input
                            type="text"
                            name="nickname"
                            value={userData?.nickname || ''}
                            onChange={handleInfoChange}
                            className={commonClassNames}
                        />
                        {errors.nickname && <p className="ml-4 text-red-500 text-sm">{errors.nickname}</p>}
                        <h2 className="text-sm text-gray-600 ml-4">비밀번호</h2>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            placeholder="새 비밀번호"
                            onChange={(e) => setPassword(e.target.value)}
                            className={commonClassNames}
                        />
                        {errors.password && <p className="ml-4 text-red-500 text-sm">{errors.password}</p>}
                        <h2 className="text-sm text-gray-600 ml-4">비밀번호 확인</h2>
                        <input
                            type="password"
                            name="passwordConfirm"
                            value={passwordConfirm}
                            placeholder="비밀번호 확인"
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            className={commonClassNames}
                        />
                        {errors.passwordConfirm && <p className="ml-4 text-red-500 text-sm">{errors.passwordConfirm}</p>}
                        <button 
                            className="bg-blue-600 text-white font-bold mt-4 mx-2 w-full hover:bg-white hover:text-blue-600"
                            onClick={handleInfoSave}
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
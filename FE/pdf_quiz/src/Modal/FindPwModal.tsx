import React, {useState} from 'react';
import closeIcon from "../assets/X.png";
import { updatePassword } from '../api/ApiUser';
import { useNavigate } from 'react-router-dom';

interface ModalProps {
    showModal: boolean;
    closeModal: () => void;
    userEmail: string; 
}

const FindPwModal: React.FC<ModalProps> = ({ showModal, closeModal, userEmail }) => {
    if (!showModal) {
        return null;
    }
    console.log('email, ', userEmail);
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [errors, setErrors] = useState<{ password?: string; passwordConfirm?: string }>({});

    const navigate = useNavigate();

    const validatePasswords = () => {
        const newErrors: { password?: string; passwordConfirm?: string } = {};
        if (password.length < 8) {
        newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다.";
        }
        if (password !== passwordConfirm) {
        newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePasswordChange = async () => {
        if (validatePasswords()) {
            try {
                await updatePassword(userEmail, { password, passwordConfirm });
                alert("비밀번호가 성공적으로 변경되었습니다!");
                closeModal(); 
                setPassword(""); 
                setPasswordConfirm("");
                navigate("/");
            } catch (error) {
                console.error("비밀번호 수정에 실패하였습니다.", error);
                alert("비밀번호 수정에 실패했습니다.");
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg max-w-md w-full flex flex-col">
                <div className="flex justify-end">
                    <img
                        src={closeIcon}
                        alt="Close"
                        onClick={closeModal}
                        className="cursor-pointer"
                        style={{ width: "16px", height: "16px", marginTop: "4px", marginRight: "4px" }}
                    />
                </div>
                <h2 className="text-xl font-bold mb-6 ml-2">비밀번호 재설정</h2>
                <input
                    type="password"
                    placeholder="새 비밀번호"
                    className="mb-3 p-2 border border-gray-300 rounded w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                <input
                    type="password"
                    placeholder="비밀번호 확인"
                    className="mb-3 p-2 border border-gray-300 rounded w-full"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                />
                {errors.passwordConfirm && (
                    <p className="text-red-500 text-sm">{errors.passwordConfirm}</p>
                )}
                <div className="w-full flex flex justify-center">
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                        onClick={handlePasswordChange}
                    >
                        저장하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FindPwModal;

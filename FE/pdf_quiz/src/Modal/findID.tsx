import { useNavigate } from "react-router-dom";
interface ModalProps {
  showModal: boolean;
  closeModal: () => void;
  name: string;
  userId: string;
}

const UserIDInfo = ({ showModal, closeModal, name, userId }: ModalProps) => {
  const navigate = useNavigate();

  const navigateToLogin = () => {
    closeModal();
    navigate("/");
  };

  return (
    showModal && (
      <div
        className={
          "w-1/2 h-1/4 bg-gray-100 flex flex-col items-center justify-center border border-black rounded-xl z-200 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 "
        }
      >
        <div className="flex flex-col items-center mb-5">
          {/* Todo: 문제별로 상태 체크해서 답안 없는 문제 counting 해서 넣기 */}
          <div>{name} 님의 아이디는 다음과 같습니다</div>
          <div>아이디: {userId}</div>
        </div>
        <div className="flex flex-row gap-2">
          <button
            className="p-2 bg-blue-600 text-white font-black rounded"
            onClick={navigateToLogin}
          >
            로그인 하러 가기
          </button>
        </div>
      </div>
    )
  );
};

export default UserIDInfo;

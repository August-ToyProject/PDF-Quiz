import closeIcon from "../assets/X.png";
import { useNavigate } from "react-router-dom";
import { saveQuizData } from "../api/ApiQuiz";
import { useQuizContext } from "../context/QuizContext";

export default function AnswerSave({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const {
    title,
    quizData,
    elapsedTime,
    userAnswers,
    timeLimitHour,
    timeLimitMinute,
  } = useQuizContext();

  const handleSave = async () => {
    try {
      const spentTime =
        (elapsedTime?.hours || 0) * 3600 +
        (elapsedTime?.minutes || 0) * 60 +
        (elapsedTime?.seconds || 0);
      const setTime = timeLimitHour * 3600 + timeLimitMinute * 60;
      const saveData = {
        title,
        setTime,
        spentTime,
        exam: quizData.map((item, index) => ({
          quizId: parseInt(item.quizId, 10),
          answer: userAnswers[index]?.[0]?.toString() || "",
          correct:
            Object.keys(item.answer)[0] === userAnswers[index]?.[0]?.toString(),
        })),
      };

      console.log("서버에 요청할 데이터:", saveData);

      await saveQuizData(
        saveData.title,
        saveData.setTime,
        saveData.spentTime,
        saveData.exam
      );
      alert("퀴즈가 성공적으로 저장되었습니다.");
      navigate("/mypage"); // 저장 후 마이페이지로 이동
    } catch (error) {
      console.error("퀴즈 저장 중 오류 발생:", error);
      alert("퀴즈 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-end">
          <img
            src={closeIcon}
            alt="Close"
            onClick={onClose}
            className="cursor-pointer"
            style={{ width: "16px", height: "16px", marginTop: "-8px" }}
          />
        </div>
        <h2 className="text-xl font-bold my-4">퀴즈를 저장하시겠습니까?</h2>
        <div className="flex justify-center">
          <button
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-full mr-2"
            onClick={handleSave}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

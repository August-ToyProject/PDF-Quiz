import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pdfLogo from "../assets/DragFile.png";
import closeIcon from "../assets/X.png";
import { useQuizContext } from "../context/QuizContext";
import { Tooltip } from "react-tooltip";
import { SyncLoader } from "react-spinners";

//👇 타입스크립트 에러 방지용 추후 해당 변수가 필요 여부에 따라 삭제 또는 수정해주세요
// import { error } from "console";

const apiUrl = import.meta.env.VITE_NGROK_URL;

interface ModalProps {
  showModal: boolean;
  closeModal: () => void;
  width?: string;
  height?: string;
  boxSize?: string;
}

export default function Upload({
  showModal,
  closeModal,
}: ModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  //드래그 active 여부
  const [isActive, setIsActive] = useState(false);
  //PDF 파일 선택 후 버튼 클릭시 선택지 활성화
  const [isSelectDisabled, setIsSelectDisabled] = useState(true);
  //PDF 파일 선택
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string | null>(null);

  const [path, setPath] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    title,
    setTitle,
    difficulty,
    setDifficulty,
    quizCount,
    setQuizCount,
    optionCount,
    setOptionCount,
    timeLimitHour,
    setTimeLimitHour,
    timeLimitMinute,
    setTimeLimitMinute,
    isQuizDataComplete,
  } = useQuizContext();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
    setTimeout(() => {
      setSnackbarVisible(false);
    }, 3000);
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!showModal) {
      // 초기값으로 되돌리기
      setTitle("");
      setDifficulty("쉬움");
      setQuizCount(10);
      setOptionCount(5);
      setTimeLimitHour(1);
      setTimeLimitMinute(0);
      setSelectedFile(null);
      setUploadMessage(null);
      setErrors(null);
      setPath("");
    }
  }, [showModal, path, title]);

  const navigateToQuiz = () => {
    navigate("/quiz");
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsActive(true);
  };
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsActive(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer!.files) {
      setIsActive(true);
    }
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsActive(false);

    if (e.dataTransfer!.files) {
      const file = e.dataTransfer!.files[0];
      if (file) {
        setSelectedFile(file);
      }
    }
  };

  const formData = new FormData();

  //Drag and Drop 버튼 클릭시 파일 선택
  const handleFileSelectClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      showSnackbar("PDF업로드 버튼을 선택하시면 선택 칸이 활성화됩니다!"); 
    }
  };
  //PDF 파일 선택 후 버튼 클릭시 선택지 활성화
  const handlePDFUploadClick = async () => {
    if (selectedFile) {
      formData.append("file", selectedFile);
      console.log(formData);
      showSnackbar("PDF 파일이 선택되었습니다!"); 
      setIsLoading(true);
    } else {
      setErrors("Please select a file first.");
    }

    try {
      const response = await fetch(`${apiUrl}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadMessage(result.message);
        setErrors(null);
        setIsLoading(false);
        setIsSelectDisabled(false);
        console.log("Upload successful:", result);

        // 업로드 성공 시 버튼에서 애니메이션 제거
        const button = document.querySelector('#PDFUploadButton') as HTMLButtonElement;
        if (button) {
          button.classList.remove('animate-color-change');
        }

        const indexPath = result.indexPath;
        setPath(indexPath); // indexPath를 state에 저장
        console.log("indexPath:", indexPath);
      } else if (response.status === 400) {
          const result = await response.json();
          setUploadMessage(result.message);
          setErrors("Upload failed: Invalid file format.");
          console.log(errors, result);
      } else {
          const result = await response.json();
          setUploadMessage(result.message);
          setErrors("Upload failed: Server error.");
          console.log("Upload failed with status:", response.status, result);
      }
    } catch (error) {
        // setUploadMessage("An error occurred while uploading the file.");
        alert("잘못된 형식의 PDF파일입니다.");
        setErrors("Network error occurred.");
        setIsLoading(false);
        console.error(errors);
    }
  };

  const handleGenerateClick = async () => {
    if (!selectedFile) {
      setErrors("Please select a PDF file to upload.");
      console.log(errors);
      return;
    }
    if (!title) {
      setTitle(selectedFile.name.slice(0, -4));
    }
    console.log(title);

    // 난이도 매핑
    let difficultyValue;
    if (difficulty === "쉬움") {
      difficultyValue = 1;
    } else if (difficulty === "보통") {
      difficultyValue = 2;
    } else if (difficulty === "어려움") {
      difficultyValue = 3;
    }

    const time = new Date();
    time.setHours(timeLimitHour, 10);
    time.setMinutes(timeLimitMinute, 10);
    formData.append("index_path", path);
    formData.append("num_questions", quizCount.toString());
    formData.append("choice_count", optionCount.toString());
    formData.append("difficulty", String(difficultyValue));

    function formDataToJSON(formData: FormData) {
      const obj: any = {};
      formData.forEach((value, key) => {
        if (!isNaN(value as any)) {
          obj[key] = Number(value);
        } else {
          obj[key] = value;
        }
      });
      return JSON.stringify(obj);
    }

    const requestData = formDataToJSON(formData);

    try {
      navigateToQuiz();
      const response = await fetch(`${apiUrl}/quiz/generate-quiz`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          "Content-type": "application/json",
        },
        body: requestData,
      });

      if (response.ok) {
        if (isQuizDataComplete) {
          const result = await response.text();
          console.log(result);
          setErrors(null);

          console.log("Generation successful:", result);
        }
      } else if (response.status === 400) {
        const result = await response.json();
        setUploadMessage(result.message);
        setErrors("Request failed: Invalid data provided.");
        console.log(errors, result);
      } else {
        const result = await response.json();
        setUploadMessage(result.message);
        setErrors("Request failed: Server error.");
        console.log("Request failed with status:", response.status, result);
      }
    } catch (error) {
      setUploadMessage("An error occurred while processing the request.");
      setErrors("Network error occurred.");
      console.error(errors, error);
    }
  };

  const handleMouseEnter = () => {
    if (isSelectDisabled) {
      const button = document.querySelector('#PDFUploadButton') as HTMLButtonElement;
      if (button) {
        button.focus();
        button.classList.add('animate-color-change');
      }
    }
  };

  const handleMouseLeave = () => {
    const button = document.querySelector('#PDFUploadButton') as HTMLButtonElement;
    if (button) {
      button.blur();
      button.classList.remove('animate-color-change'); // 애니메이션 제거
    }
  };

  if (!showModal) {
    return null;
  }

  return (
    <div className="font-body fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="flex flex-col items-center bg-customBlue rounded-xl w-[80vw] h-auto border-2 border-blue-600 lg:w-[25vw] lg:p-2 sm:w-[40vw]"
      >
        <div className=" flex flex-col items-center w-full">
          <div className="flex justify-between items-center mb-2 p-2 w-full">
            <h2 className="font-body text-base lg:text-xl font-bold">PDF Upload</h2>
            <img
              src={closeIcon}
              alt="Close"
              onClick={closeModal}
              className="w-[3vw] h-[3vw] sm:w-[2vw] sm:h-[2vw] lg:w-[1vw] lg:h-[1vw]"
            />
          </div>
          <div
            className={`w-[70vw] h-[38vh] rounded-lg flex flex-col items-center justify-center border-2 border-blue-600 bg-customWhite border-dashed lg:w-[20vw] lg:h-[18vw] sm:w-[35vw] sm:h-[30vw]
            ${
              isActive
                ? "bg-slate-200 border-3 border-dashed"
                : "bg-white border-solid"
            }`}
            onDragStart={handleDragStart}
            onDragLeave={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <img
              src={pdfLogo}
              alt="PDF Logo"
              style={{ maxWidth: "30%", maxHeight: "30%", opacity: 0.7 }}
            />
            <div className="text-blue-600 font-semibold">Drag and Drop</div>
            <div className="text-xs text-blue-600 font-semibold">Or</div>
            <button
              className="mt-1 mb-1 text-sm text-blue-600 font-semibold cursor-pointer border-1 border-gray-400"
              style={{
                textAlign: "center",
                backgroundColor: "transparent",
              }}
              onClick={handleFileSelectClick}
            >
              Select your PDF file!
            </button>
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {selectedFile && (
              <span className="mt-7 mb-3 text-sm font-semibold items-center">
                {selectedFile.name}
              </span>
            )}
          </div>
          <button
            id="PDFUploadButton"
            className="mt-4 bg-blue-600 text-white rounded-full w-[70vw] lg:w-[20vw] sm:w-[35vw]"
            data-tooltip-id="PDFUpload"
            onClick={handlePDFUploadClick}
          >
            PDF 업로드
            {isLoading && <SyncLoader size={5} color="#ffffff" />}
          </button>
          <Tooltip
            id="PDFUpload"
            content="PDF 파일 업로드 후 버튼을 클릭하셔야 선택 칸이 활성화됩니다!"
            place="bottom"
          />
          <div 
            className="flex flex-col my-4 space-y-4" 
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
          <div className="flex flex-col items-center sm:mx-[4vw]">
            {/* 제목 */}
            <div className="w-full flex items-center justify-between mb-2 mx-2">
              <span className="text-sm font-bold lg:text-md">시험지 제목</span>
              <input
                type="text"
                value={title}
                className="w-[10rem] p-3 border border-gray-400 rounded-lg lg:w-[9rem] xl:w-[12rem]"
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSelectDisabled}
              />
            </div>
            {/* 난이도 */}
            <div className="w-full flex items-center justify-between mb-2 mx-2">
              <span className="text-sm font-bold lg:text-md">난이도</span>
              <select
                className="w-[10rem] p-2 border border-gray-300 rounded-lg lg:w-[9rem] xl:w-[12rem]"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={isSelectDisabled}
              >
                <option value="쉬움">쉬움</option>
                <option value="보통">보통</option>
                <option value="어려움">어려움</option>
              </select>
            </div>
            {/* 시험 문제 수 / 선지 수 선택 */}
            <div className="w-full flex items-center justify-between mb-2 mx-2">
              <span className="text-sm font-bold lg:text-md">시험 문제</span>
              <select
                className="w-[10rem] p-2 border border-gray-300 rounded-lg lg:w-[9rem] xl:w-[12rem]"
                value={quizCount}
                onChange={(e) => setQuizCount(parseInt(e.target.value))}
                disabled={isSelectDisabled}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="25">25</option>
                <option value="30">30</option>
                <option value="35">35</option>
                <option value="40">40</option>
                <option value="45">45</option>
                <option value="50">50</option>
              </select>
            </div>
            {/* 제한 시간 선택 */}
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-sm font-bold lg:text-md">제한 시간</span>
              <div className="w-[10rem] lg:w-[9rem] xl:w-[12rem]">
                <select
                  className="w-[12.3vw] p-2 border border-gray-300 rounded-lg lg:w-[3.6vw] 2xl:w-[3.3vw] sm:w-[5.5vw]"
                  value={timeLimitHour}
                  onChange={(e) => setTimeLimitHour(parseInt(e.target.value))}
                  disabled={isSelectDisabled}
                >
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                <span className="mr-2 lg:ml-1">시간</span>
                <select
                  className="w-[12.3vw] p-2 border border-gray-300 rounded-lg lg:w-[3.6vw] 2xl:w-[3.3vw] sm:w-[5.5vw]"
                  value={timeLimitMinute}
                  onChange={(e) => setTimeLimitMinute(parseInt(e.target.value))}
                  disabled={isSelectDisabled}
                >
                  <option value="0">0</option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                  <option value="25">25</option>
                  <option value="30">30</option>
                  <option value="35">35</option>
                  <option value="40">40</option>
                  <option value="45">45</option>
                  <option value="50">50</option>
                  <option value="55">55</option>
                </select>
                <span className="">분</span>
              </div>
            </div>
            {/* 완료 버튼 */}
            <button
              className="bg-blue-600 w-[70vw] mt-1 text-white rounded-full lg:w-[20vw] lg:mt-3 sm:w-[35vw]"
              onClick={handleGenerateClick}
            >
              문제 생성하기
            </button>
          </div>
        </div>
        </div>
        {uploadMessage && (
          <div className="mt-4 text-center">
            <p>{uploadMessage}</p>
          </div>
        )}
        {snackbarVisible && (
          <div className="fixed bottom-4 right-4 bg-orange-600 text-white font-bold p-4 rounded-lg shadow-md">
            {snackbarMessage}
          </div>
        )}
      </div>
    </div>
  );
}

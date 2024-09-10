import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pdfLogo from "../assets/DragFile.png";
import closeIcon from "../assets/X.png";
import { useQuizContext } from "../context/QuizContext";
import { Tooltip } from "react-tooltip";
import { SyncLoader } from "react-spinners";

const apiUrl = import.meta.env.VITE_NGROK_URL;

//👇 타입스크립트 에러 방지용 추후 해당 변수가 필요 여부에 따라 삭제 또는 수정해주세요
// import { error } from "console";

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
  width = "700px",
  height = "440px",
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
  } = useQuizContext();

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
    }
  };
  //PDF 파일 선택 후 버튼 클릭시 선택지 활성화
  const handlePDFUploadClick = async () => {
    if (selectedFile) {
      formData.append("file", selectedFile);
      console.log(formData);
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
      setUploadMessage("An error occurred while uploading the file.");
      setErrors("Network error occurred.");
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
      const response = await fetch(
        `${apiUrl}/quiz/generate-quiz`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
            "Content-type": "application/json",
          },
          body: requestData,
        }
      );

      if (response.ok) {
        const result = await response.text();
        console.log(result);
        setErrors(null);
        console.log("Generation successful:", result);
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

  if (!showModal) {
    return null;
  }

  return (
    <div className="font-body fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="flex flex-row bg-white p-4 rounded-lg"
        style={{ width, height }}
      >
        <div className=" flex flex-1 flex-col items-start justify-start items-center space-x-2">
          <div className="flex mb-2 w-full">
            <h2 className="font-body text-xl font-bold mb-2">PDF Upload</h2>
          </div>
          <div
            className={`w-[320px] h-[320px] rounded-lg flex flex-col items-center justify-center border-2 border-blue-600
            ${
              isActive
                ? "bg-slate-200 border-3 border-dashed"
                : "bg-white border-solid"
            }`}
            // style={{ width: boxSize, height: boxSize }}
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
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
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
        </div>
        <div className="relative flex flex-1 flex-col bg-white rounded-lg">
          <img
            src={closeIcon}
            alt="Close"
            onClick={closeModal}
            className="cursor-pointer absolute top-3 right-2 "
            style={{ width: "16px", height: "16px", marginTop: "-8px" }}
          />
          <div className="flex flex-col mt-14 ml-8 space-y-5">
            {/* 주제 */}
            <div className="flex items-center">
              <span className="mr-2 font-bold">시험지 제목</span>
              <input
                type="text"
                value={title}
                className="w-[12rem] p-3 border border-gray-300 rounded"
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSelectDisabled}
              />
            </div>
            {/* 난이도 */}
            <div className="flex items-center">
              <span className="mr-2 font-bold">난이도</span>
              <select
                className="p-2 border border-gray-300 rounded ml-4 "
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
            <div className="flex items-center">
              <span className="mr-2 font-bold">시험 문제</span>
              <select
                className="p-2 border border-gray-300 rounded"
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
            <div>
              <span className="mr-2 font-bold">선지 개수</span>
              <select
                className="p-2 border border-gray-300 rounded"
                value={optionCount}
                onChange={(e) => setOptionCount(parseInt(e.target.value))}
                disabled={isSelectDisabled}
              >
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
            {/* 제한 시간 선택 */}
            <div className="flex items-center">
              <span className="mr-2 font-bold">제한 시간</span>
              <select
                className="p-2 border border-gray-300 rounded"
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
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
              <span className="ml-2 mr-2">시간</span>
              <select
                className="p-2 border border-gray-300 rounded"
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
              <span className="ml-2 mr-2">분</span>
            </div>
            {/* 완료 버튼 */}
            <div className="absolute w-full bottom-0">
              <button
                className="w-3/4 mt-auto px-4 py-2 bg-blue-600 text-white rounded"
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
      </div>
    </div>
  );
}

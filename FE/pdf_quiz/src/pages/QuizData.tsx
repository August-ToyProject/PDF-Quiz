import { useState, useEffect } from "react";
import Pagination from "react-js-pagination";
import { EventSourcePolyfill } from "event-source-polyfill";
import { useQuizContext } from "../context/QuizContext";

interface PageProps {
  page: number;
  itemsPerPage: number;
  setPage: (page: number) => void;
  setTotalPages: (page: number) => void;
}

interface QuizDataProps {
  quizId: string; 
  difficulty: string;
  question: string;
  options: { [key: string]: string };
  answer: { [key: string]: string }; // 수정된 타입
  description: string;
  slice: (startIndex: number, endIndex: number) => QuizDataProps;
}

const QuizData = ({ page, itemsPerPage, setPage, setTotalPages, }: PageProps) => {
  // props로 상태 및 함수 받음
  const [fetchedData, setFetchedData] = useState<QuizDataProps[]>([]); // 데이터를 저장할 상태
  const { setQuizData } = useQuizContext();

  useEffect(() => {
    const eventSource = new EventSourcePolyfill(
      `http://43.201.129.54:8080/api/v1/notifications/subscribe`,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accesstoken"),
        },
        //라이브러리 디폴트 타임아웃 - 45초 (45000ms) 인 것을 임의로 조정
        heartbeatTimeout: 12000000,
        withCredentials: true,
      }
    );
    //👇 타입스크립트 에러 방지용 추후 해당 변수가 필요 여부에 따라 삭제 또는 수정해주세요
    eventSource.addEventListener("sse", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received data: ", data);

        if (typeof data.options === "string") {
          data.options = JSON.parse(data.options);
        }
        if (typeof data.answer === "string") {
          data.answer = JSON.parse(data.answer);
        }

        // 상태 업데이트
        setFetchedData((prevData) => {
          // 새로운 데이터 추가
          const updatedData = [...prevData, data];

          // 총 페이지 수 계산
          setTotalPages(Math.ceil(updatedData.length / itemsPerPage));
          setQuizData(updatedData);
          return updatedData;
        });
      } catch (err) {
        console.error("Parsing error: ", err);
      }
    });

    // Error handling for SSE
    //👇 타입스크립트 에러 방지용 추후 해당 변수가 필요 여부에 따라 삭제 또는 수정해주세요
    eventSource.onerror = (err: Event) => {
      console.error("EventSource error: ", err);
      eventSource.close();
    };

    // Clean up event source when the component unmounts
    return () => {
      eventSource.close();
    };
  }, [itemsPerPage, setTotalPages, setQuizData]);

  const startIndex = (page - 1) * itemsPerPage;
  const currentItems = fetchedData.slice(startIndex, startIndex + itemsPerPage);

  const leftItems = currentItems.slice(0, 3); // 첫 번째 컬럼에 표시할 3개의 문제
  const rightItems = currentItems.slice(3); // 두 번째 컬럼에 표시할 나머지 문제들

  return (
    <div className="grid grid-cols-2 gap-4 divide-x divide-gray-400">
      {/* 왼쪽 컬럼 */}
      <ul className="flex-1 flex-col space-y-4 pl-4">
        {leftItems.map((item, index) => (
          <li key={index}>
            <div>
              {startIndex + index + 1}. {item.question}
            </div>
            <ul className="pl-5 space-y-2 mt-3">
              {Object.entries(item.options).map(([key, value]) => (
                <li key={key}>
                  ({key}) {value}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {/* 오른쪽 컬럼 */}
      <ul className="flex-1 flex-col space-y-4 pl-4">
        {rightItems.map((item, index) => (
          <li key={index}>
            <div>
              {startIndex + index + 4}. {item.question}
            </div>
            <ul className="pl-5 space-y-2 mt-3">
              {Object.entries(item.options).map(([key, value]) => (
                <li key={key}>
                  ({key}) {value}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <Pagination
        activePage={page}
        itemsCountPerPage={itemsPerPage}
        totalItemsCount={fetchedData.length}
        hideNavigation={true}
        hideFirstLastPages={true}
        onChange={(newPage) => setPage(newPage)}
        itemClass="page-item hidden"
      />
    </div>
  );
};

export default QuizData;

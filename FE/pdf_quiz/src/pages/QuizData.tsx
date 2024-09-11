import { useState, useEffect } from "react";
import Pagination from "react-js-pagination";
import { EventSourcePolyfill } from "event-source-polyfill";
import { useQuizContext } from "../context/QuizContext";
import PacmanLoader from "react-spinners/PacmanLoader";

const apiUrl = import.meta.env.VITE_NGROK_URL;

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

const QuizData = ({
  page,
  itemsPerPage,
  setPage,
  setTotalPages,
}: PageProps) => {
  // props로 상태 및 함수 받음
  const [fetchedData, setFetchedData] = useState<QuizDataProps[]>([]); // 데이터를 저장할 상태
  const { setQuizData } = useQuizContext();
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState<number>(0);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;

    let retryCount = 0;
    const maxRetries = 3;

    const connectSSE = () => {
      if (retryCount >= maxRetries) {
        console.log(
          `최대 재시도 횟수(${maxRetries})에 도달하여 더 이상 재연결을 시도하지 않습니다.`
        );
        return;
      }

      eventSource = new EventSourcePolyfill(
        `${apiUrl}/notifications/subscribe`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("accesstoken"),
          },
          //라이브러리 디폴트 타임아웃 - 45초 (45000ms) 인 것을 임의로 조정
          heartbeatTimeout: 12000000,
          withCredentials: true,
        }
      );
      eventSource.onopen = () => {
        console.log("SSE 연결이 성공적으로 열렸습니다.");
        retryCount = 0; // 연결이 성공하면 재시도 횟수 초기화
      };
      eventSource.addEventListener("sse", (event: MessageEvent) => {
        try {
          console.log("event가 생성됨", event);
          setIsLoading(false);
          const data = JSON.parse(event.data);
          console.log("Received data: ", data);

          if (!data) {
            console.log("Data is empty");
          }
          if (data === null) {
            console.log("Data is null");
          }

          if (data === undefined) {
            console.log("Data is undefined");
          }
          if (Array.isArray(data)) {
            const processedData = data.map((item: any) => {
              if (typeof item.options === "string") {
                try {
                  item.options = JSON.parse(item.options);
                } catch (err) {
                  console.error("Failed to parse options:", err);
                }
              }

              if (typeof item.answer === "string") {
                try {
                  item.answer = JSON.parse(item.answer);
                } catch (err) {
                  console.error("Failed to parse answer:", err);
                }
              }
              return item;
            });

            // 데이터가 배열인지 확인
            //     if (Array.isArray(data)) {
            //       data.forEach((item: any) => {
            //         if (typeof item.options === "string") {
            //           try {
            //             item.options = JSON.parse(item.options);
            //           } catch (err) {
            //             console.error("Failed to parse options:", err);
            //           }
            //         }

            //         if (typeof item.answer === "string") {
            //           try {
            //             item.answer = JSON.parse(item.answer);
            //           } catch (err) {
            //             console.error("Failed to parse answer:", err);
            //           }
            //         }
            //       });

            //     } else {
            //       console.log("Expected array but got: ", data);
            //     }
            //   } catch (err) {
            //     console.error("Parsing error: ", err);
            //   }
            // });

            // 상태 업데이트
            setFetchedData((prevData) => {
              const updatedData = [...prevData, ...processedData];
              setTotalItems(updatedData.length); // 총 아이템 수 업데이트
              setQuizData(updatedData);
              setTotalPages(Math.ceil(updatedData.length / itemsPerPage));
              setQuizData(updatedData);
              return updatedData;
            });
          } else {
            console.log("Expected array but got: ", data);
          }
        } catch (err) {
          console.error("Parsing error: ", err);
        }
      });
      // Error handling for SSE
      //👇 타입스크립트 에러 방지용 추후 해당 변수가 필요 여부에 따라 삭제 또는 수정해주세요
      eventSource.onerror = (err: Event) => {
        console.error("EventSource error: ", err);
        eventSource?.close();

        retryCount += 1; // 재연결 시도 횟수 증가
        if (retryCount < maxRetries) {
          retryTimeout = setTimeout(() => {
            console.log(`Reconnecting... (${retryCount}/${maxRetries})`);
            connectSSE(); // 재연결 시도
          }, 5000); // 5초 후 재연결 시도
        } else {
          console.log("재연결 횟수를 초과하여 더 이상 시도하지 않습니다.");
        }
      };
    };

    connectSSE();

    // Clean up event source when the component unmounts
    return () => {
      eventSource?.close();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [itemsPerPage]);

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = fetchedData.slice(startIndex, endIndex);

  const leftItems = currentItems.slice(0, 3); // 첫 번째 컬럼에 표시할 3개의 문제
  const rightItems = currentItems.slice(3); // 두 번째 컬럼에 표시할 나머지 문제들

  return (
    <div className="w-full font-bold flex flex-col gap-4  relative">
      {isLoading && (
        <div className="w-full absolute inset-0 flex justify-center items-center z-10 bg-white bg-opacity-80">
          <div className="flex flex-col items-center">
            <PacmanLoader color="#b0c0e0" size={40} />
            <div className="font-body mt-2 text-center">
              문제를 불러오는 중입니다...
            </div>
          </div>
        </div>
      )}

      {/* 전체 컨테이너 */}
      <div className="flex flex-1">
        {/* 왼쪽 컬럼 */}
        <ul className="flex-1 flex flex-col pl-4 space-y-4">
          {leftItems.map((item, index) => (
            <li key={index}>
              <div>
                {startIndex + index + 1}. {item.question}
              </div>
              <ul className="pl-5 space-y-2 mt-3">
                {item.options && Object.entries(item.options).length > 0 ? (
                  Object.entries(item.options).map(([key, value]) => (
                    <li key={key}>
                      ({key}) {value}
                    </li>
                  ))
                ) : (
                  <li>옵션이 없습니다.</li>
                )}
              </ul>
            </li>
          ))}
        </ul>

        {/* 오른쪽 컬럼 */}
        <ul className="flex-1 flex flex-col pl-4 space-y-4">
          {rightItems.map((item, index) => (
            <li key={index}>
              <div>
                {startIndex + index + 4}. {item.question}
              </div>
              <ul className="pl-5 space-y-2 mt-3">
                {item.options && Object.entries(item.options).length > 0 ? (
                  Object.entries(item.options).map(([key, value]) => (
                    <li key={key}>
                      ({key}) {value}
                    </li>
                  ))
                ) : (
                  <li>옵션이 없습니다.</li>
                )}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      {/* 페이지네이션 */}
      <Pagination
        activePage={page}
        itemsCountPerPage={itemsPerPage}
        totalItemsCount={totalItems}
        hideNavigation={true}
        hideFirstLastPages={true}
        onChange={(newPage) => setPage(newPage)}
        itemClass="page-item hidden"
      />
    </div>
  );
};

export default QuizData;

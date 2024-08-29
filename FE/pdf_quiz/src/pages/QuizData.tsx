import { useState, useEffect } from "react";
import Pagination from "react-js-pagination";
import { EventSourcePolyfill } from "event-source-polyfill";

interface PageProps {
  page: number;
  itemsPerPage: number;
  setPage: (page: number) => void;
  setTotalPages: (page: number) => void;
}

interface QuizDataProps {
  difficulty: string;
  question: string;
  options: { [key: string]: string };
  answer: string;
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
  const [error, setError] = useState<string | null>(null); // Store error state

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
    eventSource.onmessage = (response) => {
      try {
        const parsedData: QuizDataProps = JSON.parse(response.data);
        console.log("Parsed data: ", parsedData);

        // Add the newly received data to the state
        setFetchedData((prevData) => [...prevData, parsedData]);
        setTotalPages((prevTotal) =>
          Math.ceil((prevData.length + 1) / itemsPerPage)
        );
      } catch (err) {
        setError("Error parsing data");
        console.error("Parsing error: ", err);
      }
    };

    // Error handling for SSE
    eventSource.onerror = (err) => {
      setError("Error receiving data from server");
      console.error("EventSource error: ", err);
      eventSource.close();
    };

    // Clean up event source when the component unmounts
    return () => {
      eventSource.close();
    };
  }, [itemsPerPage, setTotalPages]);

  const startIndex = (page - 1) * itemsPerPage;
  const currentItems = fetchedData.slice(startIndex, startIndex + itemsPerPage);
  console.log("Current items to display:", currentItems); // Log current items

  return (
    <div>
      {error && <div>{error}</div>}
      <ul>
        {currentItems.map((item, index) => (
          <li key={index}>{item.question}</li>
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

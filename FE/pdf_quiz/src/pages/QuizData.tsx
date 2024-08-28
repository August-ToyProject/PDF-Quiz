import { useState, useEffect } from "react";
import Pagination from "react-js-pagination";
import ClientSSE from "../Hooks/useSSE";

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
  const { data, error } = ClientSSE();
  useEffect(() => {
    if (data) {
      // SSE로 받은 데이터가 있을 경우 처리
      setFetchedData(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    }
  }, [data, itemsPerPage]);

  const startIndex = (page - 1) * itemsPerPage;
  const currentItems = fetchedData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      {error && <div>{error.message}</div>}
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

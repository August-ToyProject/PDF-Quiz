import { useState, useEffect } from 'react';
import Pagination from 'react-js-pagination';
// import ClientSSE from '../Hooks/useSSE';

interface PageProps {
    page: number;
    itemsPerPage: number;
    setPage: (page: number) => void;
    setTotalPages: (page: number) => void;
}

// interface QuizDataProps {
//     difficulty: string;
//     question: string;
//     options: { [key: string]: string };
//     answer: string;
//     description: string;
// }


const QuizData = ({ page, itemsPerPage, setPage, setTotalPages }: PageProps) => { // props로 상태 및 함수 받음
  const [fetchedData, setFetchedData] = useState([]); // 데이터를 저장할 상태
  // const {data, error} = ClientSSE()
  useEffect(() => {
    //Todo: 가상의 코드 이므로 없애야 함
      const fetchData = async () => {
          try {
              const response = await fetch('https://jsonplaceholder.typicode.com/todos/');
              const result = await response.json();
              setFetchedData(result); // 가져온 데이터를 상태에 저장
              setTotalPages(Math.ceil(result.length / itemsPerPage));

          } catch (error) {
              console.error("Failed to fetch data", error);
          }
      };
      fetchData();
  }, [itemsPerPage, setTotalPages]);



  const startIndex = (page - 1) * itemsPerPage;
  const currentItems = fetchedData.slice(startIndex, startIndex + itemsPerPage);

  return (
      <div>
          <ul>
              {currentItems.map((item, index) => (
                  <li key={index}>{item.title}</li>
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
import { useEffect, useState } from "react";

interface SSEData {
    id: number;
    message?: string;
    data: string;

}

const ClientSSE = () => {

    const [data, setData] = useState<SSEData[]>([]);
    const [error, setError] = useState<Error | null>(null);
    
    useEffect(() => {

        //userID 1번으로 SSE 연결
        const userId = 1;
        const eventSource = new EventSource(`/api/v1/notification/subscribe/${userId}`);
       
     
    
        // sse 라는 이름의 이벤트 수신
        eventSource.addEventListener("sse", function(event) {
            try {
                //parsedData - SSEData 타입으로 파싱
                const parsedData = JSON.parse(event.data) as SSEData;
                // 이전 데이터의 배열에 새로운 데이터를 추가
                setData((prevData) => [...prevData, parsedData]);
                console.log("Event data:", parsedData)
            } catch (error) {
                console.error(error)
                setError(error as Error)
            }

        })
    
        
        // 기본 이벤트 수신
        eventSource.onmessage = function(event) {
            console.log("Default message received: ", event);
            console.log("Message data: ", event.data);
        };
    
        // 연결 시작했을 때
        eventSource.onopen = function() {
        console.log("SSE connection opened.");
        }
    
    
        // 연결 끊겼을 때
        eventSource.onerror = function() {
            console.log("SSE connection closed.");
            eventSource.close();
    
        }
    
        return () => {
            eventSource.close();
        }
    }, []);
    //pre 태그 - preformatted text (텍스트 원본 그대로 출력)
    return {data, error};
    


    
};

export default ClientSSE;


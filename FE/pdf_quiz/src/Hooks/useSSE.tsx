import {EventSourcePolyfill } from 'event-source-polyfill';

import { useEffect, useState } from "react";

interface SSEData {
    id: number;
    event?: string;
    message?: string;
    data: object;

}

const ClientSSE = () => {

    const [data] = useState<SSEData[]>([]);
    const [error, setError] = useState<Error | null>(null);
    
    useEffect(() => {

        //userID 1번으로 SSE 연결
        const userId = 1;
        const eventSource = new EventSourcePolyfill(`/api/v1/notification/subscribe/${userId}`,{
            headers: {
                "Authorization": "Bearer " + localStorage.getItem('accesstoken')

        },
        //라이브러리 디폴트 타임아웃 - 45초 (45000ms) 인 것을 임의로 조정
        heartbeatTimeout: 12000000,
        withCredentials: true,
            
    });
       
     
    
        // sse 라는 이름의 이벤트 수신
        eventSource.addEventListener("sse", function() {
            try {
                console.log("Event data:", data)
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
    }, [data]); 
    
    return {data, error};
    


    
};

export default ClientSSE;


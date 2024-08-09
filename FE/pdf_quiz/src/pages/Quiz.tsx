import timerImage from '../assets/timer.png';
import Timer from '../Hooks/Timer';

const Quiz = () => {
    return (
        //퀴즈 내용
        //퀴즈 정답 입력칸 - 모달에서 넘어온 문제 개수 및 n지 선다 종류로 
        //제한시간
        //제출버튼

        //modal 에서 props로 받아야할 내용: 1) 사용자가 입력한 제목, 문제 개수, 선지 개수
        <div className="h-screen w-full bg-white flex flex-col">
            <div className="h-16 flex flex-row justify-center">
                {/* 사용자가 입력한 제목 or pdf 파일 제목 그대로 받아와서 띄워주기 */}
                <div className="w-3/4 flex flex-start items-center bg-gray-100 pl-10">Quiz Title</div>
                {/* 사용자가 입력한 시간  */}
                <div className="w-1/4 flex flex-row gap-4 justify-center items-center">
                    <img src={timerImage} alt="clock" className="w-8 h-8"/>  
                    <div className="flex flex-col justify-center items-center">
                        <div className="flex flex-row gap-2">
                            <div>제한 시간 </div>
                            <div>00:01:00</div>
                        </div>
                        <div className="flex flex-row gap-2">
                            <div>남은 시간 </div>
                            <div><Timer/></div>
                        </div>
                    </div>                   

                </div>
            </div>

            <div className="h-14 flex flex-row justify-center">
                {/* 후에 옵션이 추가될 것을 고려하여 남겨둠 / 전체 문제 및 안푼 문제 띄우기 */}
                <div className="w-3/4 flex justify-center items-center">
                    <div className="w-2/3 left_container"> </div>
                    <div className="w-1/3 flex flex-col gap-1"> 
                        <div className="flex flex-end flex-row">
                            <div>전체 문제 </div>
                        </div>
                        <div className="flex flex-end flex-row">
                            <div>안 푼 문제 </div>
                        </div>
                    </div>

                </div>
                <div className="w-1/4 flex justify-center items-center text-xs">* 문제 번호를 누르시면 해당 번호로 이동합니다.</div>
            </div>

            <div className="h-4/5 flex flex-row justify-center">
                <div className="w-3/4 flex justify-center items-center">문제</div>
                <div className="w-1/4 flex justify-center items-center">OMR</div>
            </div>
            <div className="flex-grow flex flex-row justify-center">
                <div className="w-3/4 flex justify-center items-center bg-gray-100">
                    <button className="rounded-3xl bg-white border-black" >다음</button>
                </div>
                <div className="w-1/4 flex justify-center items-center">
                    <button className="w-full h-full bg-blue-600 text-white text-xl">제출하기</button>
                </div>
            </div>
        </div>
    );
}

export default Quiz;
interface ModalProps {
    showModal: boolean;
    closeModal: () => void;

}

const SubmitCheck = ({showModal, closeModal}: ModalProps) => {
    const handleSubmit = () => {
        closeModal();
        //Todo : 서버에 답안 내용 전송
        
    }

    return (
        showModal && (
            <div
            className={"w-96 h-48 bg-gray-100 flex flex-col items-center justify-center border border-black rounded-xl z-200 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 " +
            (showModal ? "block" : "hidden")}>
                <div className="flex flex-col items-center mb-5">
                    <div>정말 제출하시겠습니까?</div>
                    <div>지금 제출 버튼을 누르시면 그대로 채점이 진행됩니다.</div>
                    {/* Todo: 문제별로 상태 체크해서 답안 없는 문제 counting 해서 넣기 */}
                    <div>안 푼 문제: n개</div>
                </div> 
                <div className="flex flex-row gap-2">
                    <button onClick={handleSubmit}>제출</button>
                    <button onClick={closeModal}>취소</button>
                </div>
            </div>
        )
    )
    

}

export default SubmitCheck
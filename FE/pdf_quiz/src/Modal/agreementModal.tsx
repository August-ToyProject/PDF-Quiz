import React from 'react';

interface ModalProps {
    showModal: boolean;
    closeModal: () => void;
}

const AgreementModal: React.FC<ModalProps> = ({ showModal, closeModal }) => {
    if (!showModal) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg max-w-md w-full flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4">개인정보처리동의서</h2>
                <div className="mb-4 text-left text-sm">
                    <p className="mb-2">Quizgen(이하 '회사'라고 합니다)는 개인정보보호법 등 관련 법령상의 개인정보 보호 규정을 준수하며 귀하의 개인정보 보호에 최선을 다하고 있습니다. 회사는 개인정보보호법에 근거하여 다음과 같은 내용으로 개인정보를 수집 및 처리하고자 합니다.</p>
                    
                    <p className="font-bold mb-1">제1조 (개인정보 수집 및 이용 목적)</p>
                    <p className="mb-2">이용자가 제공한 모든 정보는 다음의 목적을 위해 활용하며, 목적 이외의 용도로는 사용되지 않습니다.</p>
                    <ul className="list-disc list-inside mb-4">
                        <li>본인확인</li>
                    </ul>

                    <p className="font-bold mb-1">제2조 (개인정보 수집 및 이용 항목)</p>
                    <p className="mb-2">회사는 개인정보 수집 목적을 위하여 다음과 같은 정보를 수집합니다.</p>
                    <ul className="list-disc list-inside mb-4">
                        <li>성명 및 이메일</li>
                    </ul>

                    <p className="font-bold mb-1">제3조 (개인정보 보유 및 이용 기간)</p>
                    <ul className="list-decimal list-inside mb-4">
                        <li>수집한 개인정보는 수집·이용 동의일로부터 회원 탈퇴 시까지 보관 및 이용합니다.</li>
                        <li>개인정보 보유기간의 경과, 처리 목적의 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</li>
                    </ul>

                    <p className="font-bold mb-1">제4조 (동의 거부 관리)</p>
                    <p>귀하는 본 안내에 따른 개인정보 수집·이용에 대하여 동의를 거부할 권리가 있습니다. 다만, 귀하가 개인정보 동의를 거부하시는 경우에 서비스 이용 불가의 불이익이 발생할 수 있음을 알려드립니다.</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={closeModal}>
                    확인
                </button>
            </div>
        </div>
    );
};

export default AgreementModal;

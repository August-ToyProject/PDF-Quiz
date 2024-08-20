import closeIcon from '../assets/X.png'; 
import { useNavigate } from 'react-router-dom';

export default function AnswerSave({ onClose }: { onClose: () => void }) {
    const navigate = useNavigate()

    const navigateMypage = () => {
        navigate('/mypage')
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className='flex justify-end'>
                    <img src={closeIcon} alt="Close" onClick={onClose} className="cursor-pointer" style={{ width: '16px', height: '16px', marginTop: '-8px' }} />
                </div>
                <h2 className="text-xl font-bold my-4">
                    퀴즈를 저장하시겠습니까?
                </h2>
                <div className="flex justify-center">
                    <button className="bg-blue-600 text-white font-bold py-2 px-4 rounded-full mr-2" onClick={navigateMypage}>
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}

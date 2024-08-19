import UseQuery from "../Hooks/UseQuery";
export default function FindAccount() {

    const query = UseQuery();
    const activeTab = query.get('tab') || 'id'

    //Todo 비밀번호 재설정하기 링크 누를 시 - 비밀번호 재설정 페이지로 이동


    return (
        <div className="h-screen w-full flex flex-col gap-5 justify-center items-center bg-white">
            <nav className="w-4/5 flex items-start">
                <ul className="flex flex-row gap-5">
                    <li>
                        <a className={`p-2 text-xl ${activeTab === 'id' ? 'text-blue-600' : 'text-gray-600'} font-semibold `} href='?tab=id'>아이디 찾기</a>
                    </li> 
                    <li>
                        <a className={`p-2 text-xl ${activeTab === 'password' ? 'text-blue-600' : 'text-gray-600'} font-semibold `} href='?tab=password'>비밀번호 찾기</a>
                    </li>
                </ul>

            </nav>
            <div className="w-4/5 border-2 p-7 border-gray-200 rounded-2xl">
                {activeTab === 'id' && (
                    <div className="w-full flex gap-3 flex-col items-center">
                        
                        <label className="w-3/5 flex flex-row justify-center gap-2 items-center">
                            <span className="w-1/5">이름</span>
                            <input 
                            type="text" 
                            className="w-full p-3 border border-gray-300 rounded-3xl" 
                            name='name' />
                        </label>
                        <label className="w-3/5 flex flex-row justify-center gap-2 items-center">
                            <span className="w-1/5">이메일</span>
                            <input 
                            type="text" 
                            className="w-full p-3 border border-gray-300 rounded-3xl" 
                            name="email"/>
                        </label>
                        <div className='w-full flex justify-center'>
                            <button className='p-3 bg-blue-600 text-white font-black rounded-3xl'type="submit">아이디 찾기</button>
                        </div>
                    </div>
                    

                )}
                {activeTab === 'password' && (
                    <div className="w-full flex gap-3 flex-col">
                        <div>
                            <p> ✅ 비밀번호의 경우 암호화 저장되어 분실 시 찾아드릴 수 없는 정보입니다.</p>
                            <p> ✅ 본인 확인 후 비밀번호를 재설정 할 수 있습니다.</p>
                        </div>
                        <label className="w-full flex flex-row justify-center gap-2 items-center">
                            <span className="w-1/5">이름</span>
                            <input 
                            type="text" 
                            className="w-full p-3 border border-gray-300 rounded-3xl" 
                            name='name' />
                        </label>
                        <label className="w-full flex flex-row justify-center gap-2 items-center">
                            <span className="w-1/5">아이디</span>
                            <input 
                            type="text" 
                            className="w-full p-3 border border-gray-300 rounded-3xl" 
                            name='id' />
                        </label>
                        
                        <label className="w-full flex flex-row justify-center gap-2 items-center">
                            <span className="w-1/5">이메일</span>
                            <input type="text" 
                                className="w-full p-3 border border-gray-300 rounded-3xl" 
                                name="email"
                            />
                        </label>
                        <div className='w-full flex justify-center'>
                            <button className='p-3 bg-blue-600 text-white font-black rounded-3xl'type="submit">비밀번호 재설정하기</button>
                        </div>
                    </div>
                )}


            </div>

           

        </div>

    )

}
import UseQuery from "../Hooks/UseQuery";
import { useState } from "react";
import UserIDInfo from "../Modal/findID";
import FindPwModal from "../Modal/FindPwModal";
import Header from "../components/Header";

const apiUrl = import.meta.env.VITE_NGROK_URL;

export default function FindAccount() {
  const query = UseQuery();
  const activeTab = query.get("tab") || "id";

  interface InputData {
    name: string;
    email: string;
    id: string;
  }

  const [idName, setIdName] = useState<InputData["name"]>();
  const [idEmail, setIdEmail] = useState<InputData["email"]>();
  const [pwUserId, setPwUserId] = useState<InputData["id"]>();
  const [pwEmail, setPwEmail] = useState<InputData["email"]>();

  const [showModal, setShowModal] = useState(false); // 모달
  const [userData, setUserData] = useState<{ userId: string } | null>(null); // 사용자 데이터 상태

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  //Todo 비밀번호 재설정하기 링크 누를 시 - 비밀번호 재설정 페이지로 이동
  const findID = async () => {
    try {
      const response = await fetch(`${apiUrl}/find-user?email=${idEmail}`, {
        method: "GET",
        // headers: {
        //   "Content-Type": "application/json",
        // },
      });
      if (!response.ok) {
        alert("입력하신 이메일에 해당하는 사용자가 없습니다.");
        return;
      }

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error during login:, ", error);
    }
  };

  const findPW = async () => {
    try {
      console.log("pw", pwEmail);
      const response = await fetch(`${apiUrl}/find-user?email=${pwEmail}`, {
        method: "GET",
      });
      if (!response.ok) {
        alert("입력하신 이메일에 해당하는 사용자가 없습니다.");
        return;
      }

      const data = await response.json();
      setUserData(data);

      if (data.userId === pwUserId) {
        openModal();
      } else {
        alert("입력하신 아이디 또는 이메일이 일치하지 않습니다.");
      }
    } catch (error) {
      console.error("Error during login:, ", error);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (activeTab === "id") {
      findID();
      openModal();
    }
    if (activeTab === "password") {
      findPW();
    }
  };

  return (
    <div className="h-screen">
      <Header />

      <div className="h-screen w-full flex flex-col gap-5 justify-center items-center bg-white">
        <nav className="w-4/5 flex items-start">
          <ul className="flex flex-row gap-5">
            <li>
              <a
                className={`p-2 text-md md:text-xl ${
                  activeTab === "id" ? "text-blue-600" : "text-gray-600"
                } font-semibold `}
                href="?tab=id"
              >
                아이디 찾기
              </a>
            </li>
            <li>
              <a
                className={`p-2 text-md md:text-xl ${
                  activeTab === "password" ? "text-blue-600" : "text-gray-600"
                } font-semibold `}
                href="?tab=password"
              >
                비밀번호 찾기
              </a>
            </li>
          </ul>
        </nav>
        <div className="w-4/5 border-2 p-7 border-gray-200 rounded-2xl">
          {activeTab === "id" && (
            <div className="w-full flex gap-3 flex-col items-center">
              <label className="w-full flex flex-row justify-between gap-4 items-center">
                <span className="w-1/5 text-md md:text-lg whitespace-nowrap">
                  이름
                </span>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-3xl text-sm md:text-md"
                  name="name"
                  value={idName}
                  onChange={(e) => setIdName(e.target.value)}
                />
              </label>
              <label className="w-full flex flex-row justify-center gap-3 items-center">
                <span className="w-1/5 text-md md:text-lg whitespace-nowrap">
                  이메일
                </span>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-3xl text-sm md:text-md"
                  name="email"
                  value={idEmail}
                  onChange={(e) => setIdEmail(e.target.value)}
                />
              </label>
              <div className="w-full flex justify-center">
                <button
                  className="p-3 bg-blue-600 text-white font-black rounded-3xl"
                  type="submit"
                  onClick={handleSubmit}
                >
                  아이디 찾기
                </button>
              </div>
              {userData?.userId && (
                <UserIDInfo
                  showModal={showModal}
                  closeModal={closeModal}
                  name={idName || ""}
                  userId={userData.userId}
                />
              )}
            </div>
          )}

          {activeTab === "password" && (
            <div className="w-full flex gap-3 flex-col">
              <div>
                <p className="text-sm md:text-md">
                  {" "}
                  ✅ 비밀번호의 경우 암호화 저장되어 분실 시 찾아드릴 수 없는
                  정보입니다.
                </p>
                <p className="text-sm md:text-md">
                  {" "}
                  ✅ 본인 확인 후 비밀번호를 재설정 할 수 있습니다.
                </p>
              </div>
              <label className="w-full flex flex-row justify-center gap-2 items-center">
                <span className="w-1/5 text-md md:text-lg whitespace-nowrap">
                  아이디
                </span>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-3xl text-sm md:text-md"
                  name="id"
                  value={pwUserId}
                  onChange={(e) => setPwUserId(e.target.value)}
                />
              </label>

              <label className="w-full flex flex-row justify-center gap-2 items-center">
                <span className="w-1/5 text-md md:text-lg whitespace-nowrap">
                  이메일
                </span>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-3xl text-sm md:text-md"
                  name="email"
                  value={pwEmail}
                  onChange={(e) => setPwEmail(e.target.value)}
                />
              </label>
              <div className="w-full flex justify-center">
                <button
                  className="p-3 bg-blue-600 text-white font-black rounded-3xl text-sm md:text-md"
                  type="submit"
                  onClick={handleSubmit}
                >
                  비밀번호 재설정하기
                </button>
              </div>
              {showModal && (
                <FindPwModal
                  showModal={showModal}
                  closeModal={closeModal}
                  userEmail={pwEmail || ""}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

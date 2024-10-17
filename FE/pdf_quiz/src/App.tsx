import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QuizProvider } from "./context/QuizContext";
import SignUp from "./pages/SignUp.tsx";
import Login from "./pages/Login.tsx";
import MyPage from "./pages/MyPage.tsx";
import Quiz from "./pages/Quiz.tsx";
import Answer from "./pages/Answer.tsx";
import FindAccount from "./pages/FindAccount.tsx";
import Review from "./pages/ReviewNote.tsx";
import InfoPage from "./pages/InfoPage.tsx";
import ListAnswer from "./pages/ListAnswer.tsx";
import TempPage from "./pages/TempPage.tsx";
import MainPage from "./pages/MainPage.tsx";
import { LoginProvider } from "./context/LoginContext.tsx";

function App() {
  return (
    <LoginProvider>
      <QuizProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/answer" element={<Answer />} />
            <Route path="/findAccount" element={<FindAccount />} />
            <Route path="/review" element={<Review />} />
            <Route path="/info" element={<InfoPage />} />
            <Route path="/listAnswer" element={<ListAnswer />} />
            <Route path="/temp" element={<TempPage />} />
          </Routes>
        </BrowserRouter>
      </QuizProvider>
    </LoginProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUp from "./pages/SignUp.tsx"
import Login from './pages/Login.tsx';
import MyPage from './pages/MyPage.tsx';
import Quiz from './pages/Quiz.tsx';
import Answer from './pages/Answer.tsx';
import FindAccount from './pages/FindAccount.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path ="/" element={<Login/>}/>
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/mypage" element={<MyPage/>} />
        <Route path="/quiz" element={<Quiz/>} />
        <Route path="/answer" element={<Answer/>} />
        <Route path='/findAccount' element={<FindAccount/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
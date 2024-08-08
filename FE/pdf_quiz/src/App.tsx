import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUp from "./pages/SignUp.tsx"
import Login from './pages/Login.tsx';
import MyPage from './pages/MyPage.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path ="/" element={<Login/>}/>
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/mypage" element={<MyPage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
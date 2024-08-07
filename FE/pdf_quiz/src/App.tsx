import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUp from "./pages/SignUp.tsx"
import Login from './pages/Login.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path ="/" element={<Login/>}/>
        <Route path="/signup" element={<SignUp/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
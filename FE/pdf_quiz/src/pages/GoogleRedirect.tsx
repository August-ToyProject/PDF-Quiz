import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function GoogleRedirect() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = new URL(window.location.href).searchParams.get("token");
    if (token) {
      console.log("accesstoken", token);
      localStorage.setItem("accesstoken", token);
      navigate("/mypage");
    } else {
      console.log("No token found");
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
      navigate("/login");
    }
  }, [ navigate]);

  return (
    <div>
      <h1>Google Redirect</h1>
    </div>
  );
}
export default GoogleRedirect;

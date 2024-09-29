import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function GoogleRedirect() {
  const clientId = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GOOGLE_AUTH_REDIRECT_URI;
  const secretKey = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_SECRET;
  const navigate = useNavigate();
  const code = new URL(window.location.href).searchParams.get("code");

  const apiUrl = import.meta.env.VITE_NGROK_URL;

  const getToken = async (code: string) => {
    try {
      const response = await fetch(`https://oauth2.googleapis.com/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code,
          client_id: clientId,
          client_secret: secretKey,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });
      return response.json();
    } catch (error) {
      console.error("Failed to fetch token:", error);
    }
  };

  const findUser = async (email: string) => {
    try {
      const response = await fetch(`${apiUrl}/find-user?email=${email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return response.json(); // 유저가 있는지 여부 확인 (userID 등 반환)
    } catch (error) {
      console.error("Error checking user existence:", error);
    }
  };
  const signUpUser = async (userData: any) => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData), // 유저 데이터를 회원가입 API로 전송
      });
      return response.json();
    } catch (error) {
      console.error("Error during sign-up:", error);
    }
  };

  // 구글 유저 정보 받아오기
  const getGoogleUserInfo = async (accessToken: string) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.json(); // 구글 프로필 정보 (이메일 등)
    } catch (error) {
      console.error("Failed to fetch Google user info:", error);
    }
  };
  useEffect(() => {
    if (code) {
      getToken(code).then(async (res) => {
        if (res.access_token) {
          const googleUserInfo = await getGoogleUserInfo(res.access_token);
          const { email } = googleUserInfo;
          console.log(email);

          // 유저가 있는지 확인
          const existingUser = await findUser(email);

          if (existingUser) {
            // 유저가 있으면 로그인 후 마이페이지로 이동
            localStorage.setItem("accessToken", res.access_token);
            navigate("/mypage");
          } else {
            // 유저가 없으면 자동 회원가입 후 마이페이지로 이동
            const signUpData = {
              email,
              username: googleUserInfo.name, // 이름, 이메일 등 필요한 정보
              googleId: googleUserInfo.id, // 구글 ID
            };
            await signUpUser(signUpData);
            navigate("/mypage");
          }
        }
      });
    }
  }, [code, navigate]);

  return (
    <div>
      <h1>Google Redirect</h1>
    </div>
  );
}
export default GoogleRedirect;

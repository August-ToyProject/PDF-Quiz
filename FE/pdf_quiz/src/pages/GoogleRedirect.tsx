import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function GoogleRedirect() {
  const clientId = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GOOGLE_AUTH_REDIRECT_URI;
  const secretKey = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_SECRET;
  const navigate = useNavigate();
  const code = new URL(window.location.href).searchParams.get("code");

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

  useEffect(() => {
    if (code) {
      getToken(code).then((res) => {
        if (res.access_token) {
          localStorage.setItem("accessToken", res.access_token);
          navigate("/mypage");
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

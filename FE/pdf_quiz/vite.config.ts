import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.VITE_NGROK_URL": JSON.stringify(
      process.env.REACT_APP_NGROK_URL
    ),
  },
  build: {
    rollupOptions: {
      external: ['react-spinners'], // 여기서 react-spinners를 명시적으로 외부 모듈로 지정
    },
  },
});

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
});

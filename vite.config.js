import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": "https://hagglemarket.onrender.com", // 백엔드 주소에 맞게 수정
    },
  },
  define: {
    global: "window", //sockjs용 global polyfill
  },
});

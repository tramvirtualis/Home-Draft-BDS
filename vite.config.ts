import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Mở thử trên điện thoại cùng wifi: chạy với VITE_API_URL=/api để API đi qua máy này (cùng origin, không vướng CORS)
    proxy: { "/api": "http://localhost:8080" },
  },
});

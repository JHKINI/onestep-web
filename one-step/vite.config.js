import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // 시연 영상·캡처 폴더는 화면 코드가 아니라서 감시하지 않는다.
      // (녹화 프로그램이 영상 파일을 잡고 있으면 EBUSY 오류로 개발 서버가 꺼짐)
      ignored: ['**/result/**', '**/*.mp4'],
    },
  },
})

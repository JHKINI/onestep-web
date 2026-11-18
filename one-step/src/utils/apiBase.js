// 백엔드 주소. 배포 때는 Vercel 환경변수 VITE_API_BASE_URL 로 넣는다. (끝에 / 없이)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

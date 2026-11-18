package com.onestep.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS 설정: 프론트(Vite 개발 서버)에서 /api/** 를 부를 수 있게 허용.
 * 예전에는 AiController에 @CrossOrigin으로 붙어 있었는데, 기록 API도 생겨서 한 곳으로 모았다.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    // 배포한 프론트 주소 (예: https://one-step.vercel.app). 쉼표로 여러 개 가능. 로컬은 비워둔다.
    @Value("${CORS_ALLOWED_ORIGINS:}")
    private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                // 개발용: 다른 프로젝트가 5173을 쓰고 있으면 Vite가 5174, 5175...로 옮겨가서 포트를 고정하지 않음
                .allowedOriginPatterns(
                        "http://localhost:[*]",
                        "http://127.0.0.1:[*]"
                )
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "DELETE", "OPTIONS")
                .allowedHeaders("Content-Type", "X-Device-Id");
    }
}

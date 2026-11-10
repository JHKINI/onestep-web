-- 완료한 한 걸음 기록 (예전 localStorage "one-step:history"를 옮긴 테이블)
-- 시간은 모두 UTC로 저장하고, 한국 시간 변환은 화면에서 한다.
CREATE TABLE step_history (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    device_id        CHAR(36)      NOT NULL,              -- 브라우저마다 만든 UUID (로그인 전 익명 식별자)
    client_record_id BIGINT        NULL,                  -- 브라우저에서 만든 기록 번호 (중복 저장 방지용)
    project          VARCHAR(1000) NULL,
    priority         VARCHAR(20)   NULL,                  -- IMPORTANT / URGENT
    goal             VARCHAR(500)  NULL,
    task             VARCHAR(500)  NULL,
    action           VARCHAR(500)  NOT NULL,
    completed_at     DATETIME(3)   NOT NULL,              -- 사용자가 완료한 시각
    created_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3), -- 서버에 들어온 시각
    PRIMARY KEY (id),
    UNIQUE KEY uk_step_history_device_client (device_id, client_record_id),
    KEY idx_step_history_device_completed (device_id, completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

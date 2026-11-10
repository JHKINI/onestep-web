package com.onestep.backend.history;

import java.time.Instant;

/**
 * 기록 저장 요청 1개.
 * clientRecordId: 브라우저에서 만든 번호 (같은 기록을 다시 보내도 한 번만 저장되게)
 * completedAt: "2026-11-09T07:56:25.313Z" 같은 ISO 시간. 없으면 서버 시각.
 */
public record StepHistoryRequest(
        Long clientRecordId,
        String project,
        String priority,
        String goal,
        String task,
        String action,
        Instant completedAt
) {
}

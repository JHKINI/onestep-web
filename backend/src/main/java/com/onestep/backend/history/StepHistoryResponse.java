package com.onestep.backend.history;

import java.time.Instant;

/**
 * 화면에 돌려주는 기록 1개.
 * 필드 이름은 예전 localStorage 기록과 똑같이 맞췄다 (과일 바구니 화면을 거의 안 고쳐도 되게).
 */
public record StepHistoryResponse(
        Long id,
        Long clientRecordId,
        String project,
        String priority,
        String goal,
        String task,
        String action,
        Instant completedAt
) {

    public static StepHistoryResponse from(StepHistory history) {
        return new StepHistoryResponse(
                history.getId(),
                history.getClientRecordId(),
                history.getProject(),
                history.getPriority(),
                history.getGoal(),
                history.getTask(),
                history.getAction(),
                history.getCompletedAt()
        );
    }
}

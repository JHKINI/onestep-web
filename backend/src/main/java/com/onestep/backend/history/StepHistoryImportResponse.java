package com.onestep.backend.history;

/**
 * imported: 새로 저장한 개수
 * skipped: 이미 저장돼 있었거나 action이 비어 있어서 건너뛴 개수
 */
public record StepHistoryImportResponse(
        int imported,
        int skipped
) {
}

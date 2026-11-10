package com.onestep.backend.history;

import java.util.List;

/**
 * 브라우저에 쌓인 기록을 한꺼번에 옮기는 요청.
 * (예전 localStorage 기록 + 서버가 꺼져 있을 때 대기시켜 둔 기록)
 */
public record StepHistoryImportRequest(
        List<StepHistoryRequest> records
) {
}

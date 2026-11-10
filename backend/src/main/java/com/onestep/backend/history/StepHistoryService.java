package com.onestep.backend.history;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class StepHistoryService {

    // 컬럼 길이 (V1__create_step_history.sql 과 같게)
    private static final int PROJECT_MAX = 1000;
    private static final int PRIORITY_MAX = 20;
    private static final int TEXT_MAX = 500; // goal, task, action

    private final StepHistoryRepository repository;

    public StepHistoryService(StepHistoryRepository repository) {
        this.repository = repository;
    }

    /**
     * 이 기기의 기록 목록 (최근 완료 순)
     */
    @Transactional(readOnly = true)
    public List<StepHistoryResponse> list(String deviceId) {
        return repository.findByDeviceIdOrderByCompletedAtDescIdDesc(deviceId)
                .stream()
                .map(StepHistoryResponse::from)
                .toList();
    }

    /**
     * 기록 1개 저장.
     * 같은 clientRecordId로 이미 저장된 기록이 있으면 새로 만들지 않고 그걸 돌려준다.
     * (응답을 못 받아서 브라우저가 다시 보낸 경우에도 중복이 안 생기게)
     */
    @Transactional
    public SaveResult save(String deviceId, StepHistoryRequest request) {
        if (request == null || isBlank(request.action())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "action은 비어 있을 수 없어요.");
        }

        checkLength("project", request.project(), PROJECT_MAX);
        checkLength("priority", request.priority(), PRIORITY_MAX);
        checkLength("goal", request.goal(), TEXT_MAX);
        checkLength("task", request.task(), TEXT_MAX);
        checkLength("action", request.action(), TEXT_MAX);

        Optional<StepHistory> existing = findExisting(deviceId, request.clientRecordId());
        if (existing.isPresent()) {
            return new SaveResult(StepHistoryResponse.from(existing.get()), false);
        }

        StepHistory saved = repository.save(toEntity(deviceId, request));
        return new SaveResult(StepHistoryResponse.from(saved), true);
    }

    /**
     * 브라우저에 쌓인 기록을 한꺼번에 저장.
     * 예전 기록은 입력 길이 제한이 없던 시절 것이라, 너무 길면 버리지 않고 잘라서 저장한다.
     */
    @Transactional
    public StepHistoryImportResponse importRecords(String deviceId, StepHistoryImportRequest request) {
        if (request == null || request.records() == null) {
            return new StepHistoryImportResponse(0, 0);
        }

        int imported = 0;
        int skipped = 0;

        for (StepHistoryRequest record : request.records()) {
            if (record == null || isBlank(record.action())) {
                skipped++;
                continue;
            }

            if (findExisting(deviceId, record.clientRecordId()).isPresent()) {
                skipped++;
                continue;
            }

            StepHistoryRequest trimmed = new StepHistoryRequest(
                    record.clientRecordId(),
                    cut(record.project(), PROJECT_MAX),
                    cut(record.priority(), PRIORITY_MAX),
                    cut(record.goal(), TEXT_MAX),
                    cut(record.task(), TEXT_MAX),
                    cut(record.action(), TEXT_MAX),
                    record.completedAt()
            );

            repository.save(toEntity(deviceId, trimmed));
            imported++;
        }

        return new StepHistoryImportResponse(imported, skipped);
    }

    /**
     * 기록 1개 삭제. 다른 기기의 기록이면 없는 것처럼 404.
     */
    @Transactional
    public void delete(String deviceId, Long id) {
        StepHistory history = repository.findByIdAndDeviceId(id, deviceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "기록을 찾을 수 없어요."));

        repository.delete(history);
    }

    /**
     * 이 기기의 기록 전체 삭제
     */
    @Transactional
    public void deleteAll(String deviceId) {
        repository.deleteByDeviceId(deviceId);
    }

    // ── 아래는 내부에서만 쓰는 도우미 ──

    private Optional<StepHistory> findExisting(String deviceId, Long clientRecordId) {
        if (clientRecordId == null) {
            return Optional.empty();
        }
        return repository.findByDeviceIdAndClientRecordId(deviceId, clientRecordId);
    }

    private StepHistory toEntity(String deviceId, StepHistoryRequest request) {
        Instant completedAt = request.completedAt() != null
                ? request.completedAt()
                : Instant.now();

        return new StepHistory(
                deviceId,
                request.clientRecordId(),
                emptyToNull(request.project()),
                emptyToNull(request.priority()),
                emptyToNull(request.goal()),
                emptyToNull(request.task()),
                request.action().trim(),
                completedAt
        );
    }

    private void checkLength(String field, String value, int max) {
        if (value != null && value.length() > max) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    field + "은(는) " + max + "자까지 저장할 수 있어요."
            );
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    // 빈 문자열("")은 DB에 NULL로 저장
    private static String emptyToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private static String cut(String value, int max) {
        if (value == null || value.length() <= max) {
            return value;
        }
        return value.substring(0, max);
    }

    /**
     * created: 새로 저장했으면 true, 이미 있던 걸 돌려줬으면 false
     */
    public record SaveResult(StepHistoryResponse history, boolean created) {
    }
}

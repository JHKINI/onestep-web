package com.onestep.backend.history;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.regex.Pattern;

/**
 * 완료한 한 걸음 기록 API.
 * 로그인이 없어서, 모든 요청에 X-Device-Id 헤더(브라우저마다 만든 UUID)를 받아 기기를 구분한다.
 */
@RestController
@RequestMapping("/api/history")
public class StepHistoryController {

    private static final String DEVICE_HEADER = "X-Device-Id";

    // 8-4-4-4-12 형태의 UUID
    private static final Pattern UUID_PATTERN = Pattern.compile(
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
    );

    private final StepHistoryService service;

    public StepHistoryController(StepHistoryService service) {
        this.service = service;
    }

    // 목록 조회
    @GetMapping
    public List<StepHistoryResponse> list(
            @RequestHeader(value = DEVICE_HEADER, required = false) String deviceId
    ) {
        return service.list(checkDeviceId(deviceId));
    }

    // 기록 1개 저장: 새로 만들면 201, 이미 있던 기록이면 200
    @PostMapping
    public ResponseEntity<StepHistoryResponse> save(
            @RequestHeader(value = DEVICE_HEADER, required = false) String deviceId,
            @RequestBody StepHistoryRequest request
    ) {
        StepHistoryService.SaveResult result = service.save(checkDeviceId(deviceId), request);

        HttpStatus status = result.created() ? HttpStatus.CREATED : HttpStatus.OK;
        return ResponseEntity.status(status).body(result.history());
    }

    // 브라우저에 쌓인 기록 한꺼번에 옮기기
    @PostMapping("/import")
    public StepHistoryImportResponse importRecords(
            @RequestHeader(value = DEVICE_HEADER, required = false) String deviceId,
            @RequestBody StepHistoryImportRequest request
    ) {
        return service.importRecords(checkDeviceId(deviceId), request);
    }

    // 기록 1개 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader(value = DEVICE_HEADER, required = false) String deviceId,
            @PathVariable Long id
    ) {
        service.delete(checkDeviceId(deviceId), id);
        return ResponseEntity.noContent().build();
    }

    // 이 기기의 기록 전체 삭제
    @DeleteMapping
    public ResponseEntity<Void> deleteAll(
            @RequestHeader(value = DEVICE_HEADER, required = false) String deviceId
    ) {
        service.deleteAll(checkDeviceId(deviceId));
        return ResponseEntity.noContent().build();
    }

    private String checkDeviceId(String deviceId) {
        if (deviceId == null || !UUID_PATTERN.matcher(deviceId).matches()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    DEVICE_HEADER + " 헤더에 UUID가 필요해요."
            );
        }
        return deviceId.toLowerCase();
    }
}

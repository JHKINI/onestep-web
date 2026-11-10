package com.onestep.backend.history;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface StepHistoryRepository extends JpaRepository<StepHistory, Long> {

    // 이 기기의 기록 전체, 최근에 완료한 순서
    List<StepHistory> findByDeviceIdOrderByCompletedAtDescIdDesc(String deviceId);

    // 이 기기의 기록 1개 (다른 기기 기록은 못 건드리게)
    Optional<StepHistory> findByIdAndDeviceId(Long id, String deviceId);

    // 같은 브라우저 기록 번호로 이미 저장된 게 있는지
    Optional<StepHistory> findByDeviceIdAndClientRecordId(String deviceId, Long clientRecordId);

    @Transactional
    long deleteByDeviceId(String deviceId);
}

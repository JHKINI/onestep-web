package com.onestep.backend.history;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * 완료한 한 걸음 기록 1개 (테이블: step_history)
 * 테이블 구조는 db/migration/V1__create_step_history.sql 에서 만든다.
 */
@Entity
@Table(name = "step_history")
public class StepHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AUTO_INCREMENT
    private Long id;

    // 브라우저마다 만든 UUID (로그인이 생기기 전까지 이걸로 사용자를 구분)
    @Column(name = "device_id", nullable = false, length = 36)
    private String deviceId;

    // 브라우저에서 만든 기록 번호. 같은 기록이 두 번 저장되는 걸 막는 데 쓴다.
    @Column(name = "client_record_id")
    private Long clientRecordId;

    @Column(name = "project", length = 1000)
    private String project;

    @Column(name = "priority", length = 20)
    private String priority;

    @Column(name = "goal", length = 500)
    private String goal;

    @Column(name = "task", length = 500)
    private String task;

    @Column(name = "action", nullable = false, length = 500)
    private String action;

    // 사용자가 완료한 시각 (UTC)
    @Column(name = "completed_at", nullable = false)
    private Instant completedAt;

    // 서버에 저장된 시각 (UTC)
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // JPA가 쓰는 기본 생성자
    protected StepHistory() {
    }

    public StepHistory(
            String deviceId,
            Long clientRecordId,
            String project,
            String priority,
            String goal,
            String task,
            String action,
            Instant completedAt
    ) {
        this.deviceId = deviceId;
        this.clientRecordId = clientRecordId;
        this.project = project;
        this.priority = priority;
        this.goal = goal;
        this.task = task;
        this.action = action;
        this.completedAt = completedAt;
    }

    // DB에 넣기 직전에 서버 시각을 기록
    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public Long getClientRecordId() {
        return clientRecordId;
    }

    public String getProject() {
        return project;
    }

    public String getPriority() {
        return priority;
    }

    public String getGoal() {
        return goal;
    }

    public String getTask() {
        return task;
    }

    public String getAction() {
        return action;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}

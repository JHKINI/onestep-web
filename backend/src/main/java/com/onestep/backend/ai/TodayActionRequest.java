package com.onestep.backend.ai;

public record TodayActionRequest(
        String concern,
        String goal,
        String task
) {
}
package com.onestep.backend.ai;

public record ShrinkActionRequest(
        String concern,
        String goal,
        String task,
        String action
) {}
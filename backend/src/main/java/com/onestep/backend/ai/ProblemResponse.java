package com.onestep.backend.ai;

import java.util.List;

public record ProblemResponse(
        List<ProblemItem> problems
) {
    public record ProblemItem(
            String title,
            String description
    ) {
    }
}
package com.placementai.dto.response;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillGapResponse {
    private String targetRole;
    private List<String> presentSkills;
    private List<String> missingSkills;
    private List<RoadmapWeek> roadmap;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoadmapWeek {
        private int week;
        private String topic;
        private String description;
    }
}

package com.placementai.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private String userName;
    private Integer atsScore;
    private long totalProblems;
    private long solvedProblems;
    private long totalInterviews;
    private double avgInterviewScore;
    private long completedRoadmapItems;
    private long totalRoadmapItems;
    private long totalSkills;
}

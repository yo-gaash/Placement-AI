package com.placementai.dto.response;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodingProfileResponse {
    private String leetcodeUrl;
    private String gfgUrl;
    private String githubUrl;
    private LeetCodeStats leetcodeStats;
    private GitHubStats githubStats;
    private GfgStats gfgStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeetCodeStats {
        private String username;
        private int totalSolved;
        private int easySolved;
        private int mediumSolved;
        private int hardSolved;
        private int ranking;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GitHubStats {
        private String username;
        private int publicRepos;
        private int followers;
        private int totalContributions;
        private List<Map<String, Object>> contributions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GfgStats {
        private String username;
        private int overallScore;
        private int problemsSolved;
    }
}

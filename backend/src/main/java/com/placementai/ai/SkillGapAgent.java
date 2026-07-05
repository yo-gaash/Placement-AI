package com.placementai.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class SkillGapAgent {

    private final GroqClient groqClient;
    private final ObjectMapper objectMapper;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillGapResult {
        private List<String> missingSkills = new ArrayList<>();
        private List<RoadmapItem> roadmap = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoadmapItem {
        private int week;
        private String topic;
        private String description;
    }

    public SkillGapResult analyzeSkillGap(String targetRole, List<String> currentSkills) {
        String prompt = String.format("""
                I want to become a %s.
                My current skills are: %s
                
                Analyze the skill gap and create a 4-8 week learning roadmap.
                Respond with ONLY a valid JSON object (no markdown, no code blocks):
                {
                  "missingSkills": ["Docker", "Redis", "AWS"],
                  "roadmap": [
                    {"week": 1, "topic": "Docker Fundamentals", "description": "Learn Docker containers, images, and Docker Compose"},
                    {"week": 2, "topic": "AWS Basics", "description": "Learn EC2, S3, RDS, and IAM fundamentals"}
                  ]
                }
                """, targetRole, String.join(", ", currentSkills));

        String response = groqClient.generateContent(prompt);

        try {
            String json = extractJson(response);
            return objectMapper.readValue(json, SkillGapResult.class);
        } catch (Exception e) {
            log.error("Failed to parse skill gap response: {}", e.getMessage());
            SkillGapResult result = new SkillGapResult();
            result.setMissingSkills(List.of("Unable to analyze at this time"));
            return result;
        }
    }

    private String extractJson(String text) {
        if (text == null) return "{}";
        text = text.trim();
        if (text.startsWith("```json")) text = text.substring(7);
        else if (text.startsWith("```")) text = text.substring(3);
        if (text.endsWith("```")) text = text.substring(0, text.lastIndexOf("```"));
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start >= 0 && end > start) return text.substring(start, end + 1);
        return text.trim();
    }
}

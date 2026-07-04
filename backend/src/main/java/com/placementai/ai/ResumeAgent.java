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
public class ResumeAgent {

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResumeAnalysisResult {
        private int atsScore;
        private List<String> presentKeywords = new ArrayList<>();
        private List<String> missingKeywords = new ArrayList<>();
        private List<String> suggestions = new ArrayList<>();
        private String overallFeedback;
    }

    public ResumeAnalysisResult analyzeResume(String resumeText, String targetRole) {
        String truncated = resumeText != null && resumeText.length() > 3000
                ? resumeText.substring(0, 3000) + "..."
                : resumeText;

        String role = targetRole != null && !targetRole.isBlank() ? targetRole : "Software Developer";

        String prompt = String.format("""
                Analyze this resume for a %s position. 
                Respond with ONLY a valid JSON object (no markdown, no code blocks, no explanation).
                Use this exact JSON structure:
                {
                  "atsScore": 75,
                  "presentKeywords": ["Java", "Spring Boot"],
                  "missingKeywords": ["Docker", "Kubernetes"],
                  "suggestions": ["Add quantified achievements", "Include GitHub profile link"],
                  "overallFeedback": "Your resume is good but needs improvement in..."
                }
                
                Resume text:
                %s
                """, role, truncated);

        String response = geminiClient.generateContent(prompt);

        try {
            String json = extractJson(response);
            return objectMapper.readValue(json, ResumeAnalysisResult.class);
        } catch (Exception e) {
            log.error("Failed to parse resume analysis response: {}", e.getMessage());
            ResumeAnalysisResult defaultResult = new ResumeAnalysisResult();
            defaultResult.setAtsScore(50);
            defaultResult.setOverallFeedback(response);
            return defaultResult;
        }
    }

    private String extractJson(String text) {
        if (text == null) return "{}";
        // Strip markdown code blocks if present
        text = text.trim();
        if (text.startsWith("```json")) {
            text = text.substring(7);
            int end = text.lastIndexOf("```");
            if (end > 0) text = text.substring(0, end);
        } else if (text.startsWith("```")) {
            text = text.substring(3);
            int end = text.lastIndexOf("```");
            if (end > 0) text = text.substring(0, end);
        }
        // Find first { and last }
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return text.substring(start, end + 1);
        }
        return text.trim();
    }
}

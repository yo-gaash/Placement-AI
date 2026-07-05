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

    private final GroqClient groqClient;
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

        String response = groqClient.generateContent(prompt);

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

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobMatch {
        private String role;
        private int matchPercentage;
        private String reason;
        private List<String> requiredSkills = new ArrayList<>();
        private List<String> skillsToAcquire = new ArrayList<>();
    }

    public List<JobMatch> matchJobs(String resumeText) {
        String truncated = resumeText != null && resumeText.length() > 3000
                ? resumeText.substring(0, 3000) + "..."
                : resumeText;

        String prompt = String.format("""
                Match this resume against standard tech industry job profiles.
                Recommend 3-4 matching job roles (e.g. Java Backend Developer, SDE-1, QA Engineer, Frontend Developer).
                Provide a matching percentage (0 to 100), detailed matching explanation, list of skills from their resume that match, and missing skills to acquire.
                
                Respond with ONLY a valid JSON array of objects (no markdown, no code blocks):
                [
                  {
                    "role": "Java Backend Developer",
                    "matchPercentage": 92,
                    "reason": "You have solid Java and Spring Boot experience which match this role perfectly.",
                    "requiredSkills": ["Java", "Spring Boot", "MySQL"],
                    "skillsToAcquire": ["Kafka", "AWS"]
                  }
                ]
                
                Resume text:
                %s
                """, truncated);

        String response = groqClient.generateContent(prompt);

        try {
            String json = extractJsonArray(response);
            return objectMapper.readValue(json, new com.fasterxml.jackson.core.type.TypeReference<List<JobMatch>>() {});
        } catch (Exception e) {
            log.error("Failed to parse job matches: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    private String extractJsonArray(String text) {
        if (text == null) return "[]";
        text = text.trim();
        if (text.startsWith("```json")) text = text.substring(7);
        else if (text.startsWith("```")) text = text.substring(3);
        if (text.endsWith("```")) text = text.substring(0, text.lastIndexOf("```"));
        int start = text.indexOf('[');
        int end = text.lastIndexOf(']');
        if (start >= 0 && end > start) return text.substring(start, end + 1);
        return "[]";
    }
}

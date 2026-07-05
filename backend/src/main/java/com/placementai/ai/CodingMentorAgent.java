package com.placementai.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CodingMentorAgent {

    private final GroqClient groqClient;
    private final ObjectMapper objectMapper;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProblemRecommendation {
        private String name;
        private String difficulty;
        private String topic;
        private String reason;
    }

    public List<ProblemRecommendation> getNextProblems(List<String> solvedProblems, String currentTopic) {
        String solved = solvedProblems.isEmpty() ? "None yet" : String.join(", ", solvedProblems.subList(0, Math.min(solvedProblems.size(), 10)));
        String topic = currentTopic != null && !currentTopic.isBlank() ? currentTopic : "Data Structures";

        String prompt = String.format("""
                I am learning %s and have solved these problems: %s
                
                Recommend 5 next LeetCode-style problems to solve.
                Respond with ONLY a valid JSON array (no markdown, no code blocks):
                [
                  {"name": "Two Sum", "difficulty": "Easy", "topic": "Arrays/HashMap", "reason": "Fundamental problem for HashMap usage"},
                  {"name": "Sliding Window Maximum", "difficulty": "Hard", "topic": "Sliding Window", "reason": "Extends basic sliding window concept"}
                ]
                """, topic, solved);

        String response = groqClient.generateContent(prompt);

        try {
            String json = extractJsonArray(response);
            return objectMapper.readValue(json, new TypeReference<List<ProblemRecommendation>>() {});
        } catch (Exception e) {
            log.error("Failed to parse problem recommendations: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public String getTodaysPlan(List<String> skills, int totalSolved, int totalProblems) {
        String prompt = String.format("""
                Create a daily study plan for a placement preparation student.
                Their skills: %s
                Progress: %d/%d problems solved
                
                Generate a structured daily schedule from 8 AM to 8 PM with specific topics, breaks, and practice sessions.
                Format it clearly with times and activities.
                """, String.join(", ", skills), totalSolved, totalProblems);

        return groqClient.generateContent(prompt);
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

package com.placementai.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class CommunicationAgent {

    private final GroqClient groqClient;
    private final ObjectMapper objectMapper;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommunicationFeedback {
        private int grammarScore;
        private int confidenceScore;
        private int fluencyScore;
        private Map<String, Integer> fillerWords = new HashMap<>();
        private List<String> suggestions = new ArrayList<>();
        private String feedback;
    }

    public CommunicationFeedback evaluateSpeech(String speechText) {
        String prompt = String.format("""
                Analyze this spoken response text for communication coaching.
                Provide scores from 0 to 10 for grammar, confidence, and fluency.
                Identify and count filler words (e.g. "like", "um", "ah", "you know", "so", "actually").
                Provide specific, actionable suggestions and overall feedback.
                
                Respond with ONLY a valid JSON object in this exact format (no markdown, no code blocks):
                {
                  "grammarScore": 8,
                  "confidenceScore": 7,
                  "fluencyScore": 7,
                  "fillerWords": { "like": 3, "um": 2 },
                  "suggestions": ["suggestion 1", "suggestion 2"],
                  "feedback": "Your overall delivery is..."
                }
                
                Speech text to analyze:
                %s
                """, speechText);

        String response = groqClient.generateContent(prompt);

        try {
            String json = extractJson(response);
            return objectMapper.readValue(json, CommunicationFeedback.class);
        } catch (Exception e) {
            log.error("Failed to parse speech evaluation: {}", e.getMessage());
            CommunicationFeedback defaultFeedback = new CommunicationFeedback();
            defaultFeedback.setGrammarScore(5);
            defaultFeedback.setConfidenceScore(5);
            defaultFeedback.setFluencyScore(5);
            defaultFeedback.setFeedback(response);
            return defaultFeedback;
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

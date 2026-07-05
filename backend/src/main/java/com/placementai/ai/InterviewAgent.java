package com.placementai.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class InterviewAgent {

    private final GroqClient groqClient;
    private final ObjectMapper objectMapper;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewFeedback {
        private int score;
        private String feedback;
    }

    public String generateQuestion(String interviewType, List<String> previousQuestions) {
        String previousQuestionsText = previousQuestions.isEmpty()
                ? "None"
                : previousQuestions.stream().limit(5).collect(Collectors.joining("\n- ", "- ", ""));

        String prompt = String.format("""
                Generate ONE unique interview question for a %s interview.
                Do NOT repeat any of these previously asked questions:
                %s
                
                Return ONLY the question text, nothing else. No numbering, no explanation.
                """, interviewType, previousQuestionsText);

        return groqClient.generateContent(prompt).trim();
    }

    public InterviewFeedback evaluateAnswer(String question, String answer, String interviewType) {
        String prompt = String.format("""
                Evaluate this interview answer for a %s interview question.
                
                Question: %s
                
                Answer: %s
                
                Respond with ONLY a valid JSON object (no markdown, no code blocks):
                {
                  "score": 7,
                  "feedback": "Good explanation of the concept. However, you could improve by mentioning..."
                }
                
                Score must be an integer from 0 to 10.
                """, interviewType, question, answer);

        String response = groqClient.generateContent(prompt);

        try {
            String json = extractJson(response);
            return objectMapper.readValue(json, InterviewFeedback.class);
        } catch (Exception e) {
            log.error("Failed to parse interview feedback: {}", e.getMessage());
            return new InterviewFeedback(5, response);
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

package com.placementai.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChatAgent {

    private final GeminiClient geminiClient;

    public String chat(String userMessage, String agentType, List<String> conversationHistory) {
        String systemContext = getSystemContext(agentType);

        String historyText = conversationHistory.isEmpty()
                ? ""
                : "Previous conversation:\n" + conversationHistory.stream()
                .limit(5)
                .collect(Collectors.joining("\n")) + "\n\n";

        String prompt = systemContext + "\n\n" + historyText + "User: " + userMessage + "\n\nAssistant:";

        return geminiClient.generateContent(prompt);
    }

    private String getSystemContext(String agentType) {
        if (agentType == null) agentType = "GENERAL";

        return switch (agentType.toUpperCase()) {
            case "RESUME_COACH" -> """
                    You are an expert resume coach and career advisor with 10+ years of experience in tech recruitment.
                    Help the user improve their resume, understand ATS systems, and craft compelling career narratives.
                    Be specific, actionable, and encouraging.
                    """;
            case "INTERVIEW_COACH" -> """
                    You are a senior software engineer and interview coach who has conducted 500+ technical interviews.
                    Help the user prepare for technical and HR interviews. Provide detailed answers, explain concepts clearly,
                    and give constructive feedback. Cover Java, Spring Boot, SQL, System Design, and behavioral questions.
                    """;
            case "CODING_MENTOR" -> """
                    You are an expert competitive programmer and coding mentor who has solved 2000+ LeetCode problems.
                    Help the user with data structures, algorithms, problem-solving approaches, and coding best practices.
                    Explain time/space complexity, provide hints before full solutions, and suggest similar problems.
                    """;
            default -> """
                    You are an AI placement preparation assistant helping students succeed in campus placements and job interviews.
                    You have expertise in resume building, technical interviews, coding practice, and career guidance.
                    Be helpful, encouraging, and provide actionable advice.
                    """;
        };
    }
}

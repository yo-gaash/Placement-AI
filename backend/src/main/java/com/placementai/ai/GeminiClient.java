package com.placementai.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class GeminiClient {

    private final WebClient geminiWebClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @SuppressWarnings("unchecked")
    public String generateContent(String prompt) {
        try {
            Map<String, Object> part = Map.of("text", prompt);
            Map<String, Object> content = Map.of("parts", List.of(part));
            Map<String, Object> requestBody = Map.of("contents", List.of(content));

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
            Map<String, Object> response = geminiWebClient.post()
                    .uri(new java.net.URI(url))
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) return "AI service returned empty response.";

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates == null || candidates.isEmpty()) return "No response from AI.";

            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> contentMap = (Map<String, Object>) firstCandidate.get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");

            return (String) parts.get(0).get("text");

        } catch (Exception e) {
            log.error("Gemini API error: {}", e.getMessage());
            return "AI service is currently unavailable. Please try again later.";
        }
    }
}

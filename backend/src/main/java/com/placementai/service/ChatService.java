package com.placementai.service;

import com.placementai.ai.ChatAgent;
import com.placementai.dto.request.ChatRequest;
import com.placementai.dto.response.ChatResponse;
import com.placementai.entity.ChatHistory;
import com.placementai.entity.User;
import com.placementai.exception.ResourceNotFoundException;
import com.placementai.repository.ChatHistoryRepository;
import com.placementai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatHistoryRepository chatHistoryRepository;
    private final UserRepository userRepository;
    private final ChatAgent chatAgent;

    public ChatResponse chat(Long userId, ChatRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        String agentType = request.getAgentType() != null ? request.getAgentType() : "GENERAL";

        // Get last 5 messages for context
        List<String> history = chatHistoryRepository
                .findByUserIdAndAgentTypeOrderByCreatedAtAsc(userId, agentType)
                .stream()
                .limit(5)
                .map(c -> "User: " + c.getPrompt() + "\nAssistant: " + c.getResponse())
                .collect(Collectors.toList());

        String response = chatAgent.chat(request.getPrompt(), agentType, history);

        ChatHistory chatHistory = ChatHistory.builder()
                .user(user)
                .agentType(agentType)
                .prompt(request.getPrompt())
                .response(response)
                .build();
        chatHistory = chatHistoryRepository.save(chatHistory);

        return mapToResponse(chatHistory);
    }

    public List<ChatResponse> getHistory(Long userId, String agentType) {
        List<ChatHistory> history = agentType != null && !agentType.isBlank()
                ? chatHistoryRepository.findByUserIdAndAgentTypeOrderByCreatedAtAsc(userId, agentType)
                : chatHistoryRepository.findByUserIdOrderByCreatedAtAsc(userId);

        return history.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private ChatResponse mapToResponse(ChatHistory c) {
        return ChatResponse.builder()
                .id(c.getId())
                .prompt(c.getPrompt())
                .response(c.getResponse())
                .agentType(c.getAgentType())
                .createdAt(c.getCreatedAt())
                .build();
    }
}

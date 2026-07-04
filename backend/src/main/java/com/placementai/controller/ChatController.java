package com.placementai.controller;

import com.placementai.dto.request.ChatRequest;
import com.placementai.dto.response.ApiResponse;
import com.placementai.dto.response.ChatResponse;
import com.placementai.service.ChatService;
import com.placementai.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "AI chat with specialized agents")
public class ChatController {

    private final ChatService chatService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @Operation(summary = "Send a message to an AI agent")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(@RequestBody ChatRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(chatService.chat(userId, request)));
    }

    @GetMapping("/history")
    @Operation(summary = "Get chat history")
    public ResponseEntity<ApiResponse<List<ChatResponse>>> getHistory(
            @RequestParam(required = false) String agentType) {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(chatService.getHistory(userId, agentType)));
    }
}

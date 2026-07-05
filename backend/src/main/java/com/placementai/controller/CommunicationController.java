package com.placementai.controller;

import com.placementai.ai.CommunicationAgent;
import com.placementai.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/communication")
@RequiredArgsConstructor
@Tag(name = "Communication", description = "Speech coaching and communication coach agent")
public class CommunicationController {

    private final CommunicationAgent communicationAgent;

    @PostMapping("/evaluate")
    @Operation(summary = "Evaluate speech response")
    public ResponseEntity<ApiResponse<CommunicationAgent.CommunicationFeedback>> evaluateSpeech(
            @RequestBody Map<String, String> payload) {
        String text = payload.getOrDefault("speechText", "");
        return ResponseEntity.ok(ApiResponse.success(communicationAgent.evaluateSpeech(text)));
    }
}

package com.placementai.controller;

import com.placementai.dto.request.InterviewAnswerRequest;
import com.placementai.dto.response.ApiResponse;
import com.placementai.dto.response.InterviewResponse;
import com.placementai.service.InterviewService;
import com.placementai.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interview")
@RequiredArgsConstructor
@Tag(name = "Interview", description = "Mock interview sessions")
public class InterviewController {

    private final InterviewService interviewService;
    private final SecurityUtils securityUtils;

    @PostMapping("/start")
    @Operation(summary = "Start a mock interview session")
    public ResponseEntity<ApiResponse<InterviewResponse>> startInterview(@RequestBody Map<String, String> body) {
        Long userId = securityUtils.getCurrentUserId();
        String interviewType = body.getOrDefault("interviewType", "JAVA");
        return ResponseEntity.ok(ApiResponse.success(interviewService.startInterview(userId, interviewType)));
    }

    @PostMapping("/answer")
    @Operation(summary = "Submit answer and get AI score + feedback")
    public ResponseEntity<ApiResponse<InterviewResponse>> submitAnswer(@RequestBody InterviewAnswerRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(interviewService.submitAnswer(userId, request)));
    }

    @GetMapping("/history")
    @Operation(summary = "Get interview history")
    public ResponseEntity<ApiResponse<List<InterviewResponse>>> getHistory() {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(interviewService.getHistory(userId)));
    }

    @GetMapping("/history/{type}")
    @Operation(summary = "Get interview history by type")
    public ResponseEntity<ApiResponse<List<InterviewResponse>>> getHistoryByType(@PathVariable String type) {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(interviewService.getHistoryByType(userId, type)));
    }
}

package com.placementai.controller;

import com.placementai.ai.CodingMentorAgent;
import com.placementai.dto.request.CodingProgressRequest;
import com.placementai.dto.response.ApiResponse;
import com.placementai.entity.CodingProgress;
import com.placementai.service.CodingService;
import com.placementai.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coding")
@RequiredArgsConstructor
@Tag(name = "Coding", description = "Coding problem tracker and AI mentor")
public class CodingController {

    private final CodingService codingService;
    private final SecurityUtils securityUtils;

    @PostMapping("/add")
    @Operation(summary = "Add a coding problem")
    public ResponseEntity<ApiResponse<CodingProgress>> addProblem(@RequestBody CodingProgressRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(codingService.addProblem(userId, request)));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update problem status")
    public ResponseEntity<ApiResponse<CodingProgress>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success(codingService.updateStatus(id, status)));
    }

    @GetMapping("/me")
    @Operation(summary = "Get all problems for current user")
    public ResponseEntity<ApiResponse<List<CodingProgress>>> getProblems() {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(codingService.getUserProblems(userId)));
    }

    @GetMapping("/recommendations")
    @Operation(summary = "Get AI-recommended next problems")
    public ResponseEntity<ApiResponse<List<CodingMentorAgent.ProblemRecommendation>>> getRecommendations() {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(codingService.getNextRecommendations(userId)));
    }

    @GetMapping("/today-plan")
    @Operation(summary = "Get AI-generated daily study plan")
    public ResponseEntity<ApiResponse<String>> getTodaysPlan() {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(codingService.getTodaysPlan(userId)));
    }
}

package com.placementai.controller;

import com.placementai.dto.request.CodingProfileRequest;
import com.placementai.dto.response.ApiResponse;
import com.placementai.dto.response.CodingProfileResponse;
import com.placementai.service.CodingProfileService;
import com.placementai.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coding/profile")
@RequiredArgsConstructor
@Tag(name = "Coding Profile", description = "LeetCode, GFG, and GitHub profile stats tracking")
public class CodingProfileController {

    private final CodingProfileService codingProfileService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @Operation(summary = "Save or update coding profile URLs")
    public ResponseEntity<ApiResponse<?>> saveProfile(@RequestBody CodingProfileRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        codingProfileService.saveProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Coding profiles updated successfully", null));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get saved profile links and live statistics")
    public ResponseEntity<ApiResponse<CodingProfileResponse>> getProfileStats() {
        Long userId = securityUtils.getCurrentUserId();
        CodingProfileResponse stats = codingProfileService.getProfileStats(userId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}

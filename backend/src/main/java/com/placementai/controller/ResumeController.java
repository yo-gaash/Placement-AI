package com.placementai.controller;

import com.placementai.dto.response.ApiResponse;
import com.placementai.dto.response.ResumeResponse;
import com.placementai.service.ResumeService;
import com.placementai.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
@Tag(name = "Resume", description = "Resume upload and analysis")
public class ResumeController {

    private final ResumeService resumeService;
    private final SecurityUtils securityUtils;

    @PostMapping("/upload")
    @Operation(summary = "Upload PDF resume and get AI analysis")
    public ResponseEntity<ApiResponse<ResumeResponse>> uploadResume(
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false, defaultValue = "Software Developer") String targetRole) throws IOException {
        Long userId = securityUtils.getCurrentUserId();
        ResumeResponse response = resumeService.uploadAndAnalyze(userId, file, targetRole);
        return ResponseEntity.ok(ApiResponse.success("Resume analyzed successfully", response));
    }

    @GetMapping("/me/latest")
    @Operation(summary = "Get latest resume analysis")
    public ResponseEntity<ApiResponse<ResumeResponse>> getLatestResume() {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(resumeService.getLatestResume(userId)));
    }

    @GetMapping("/me/all")
    @Operation(summary = "Get all resumes")
    public ResponseEntity<ApiResponse<List<ResumeResponse>>> getAllResumes() {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(resumeService.getAllResumes(userId)));
    }
}

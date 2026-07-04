package com.placementai.controller;

import com.placementai.dto.response.ApiResponse;
import com.placementai.dto.response.DashboardResponse;
import com.placementai.service.DashboardService;
import com.placementai.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "User dashboard stats")
public class DashboardController {

    private final DashboardService dashboardService;
    private final SecurityUtils securityUtils;

    @GetMapping("/me")
    @Operation(summary = "Get dashboard stats for current user")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDashboard(userId)));
    }
}

package com.placementai.controller;

import com.placementai.dto.response.ApiResponse;
import com.placementai.entity.LearningRoadmap;
import com.placementai.service.RoadmapService;
import com.placementai.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/roadmap")
@RequiredArgsConstructor
@Tag(name = "Roadmap", description = "Learning roadmap management")
public class RoadmapController {

    private final RoadmapService roadmapService;
    private final SecurityUtils securityUtils;

    @GetMapping("/me")
    @Operation(summary = "Get learning roadmap")
    public ResponseEntity<ApiResponse<List<LearningRoadmap>>> getRoadmap() {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(roadmapService.getRoadmap(userId)));
    }

    @PutMapping("/{id}/complete")
    @Operation(summary = "Toggle roadmap item completion")
    public ResponseEntity<ApiResponse<LearningRoadmap>> markComplete(
            @PathVariable Long id,
            @RequestParam boolean completed) {
        return ResponseEntity.ok(ApiResponse.success(roadmapService.markCompleted(id, completed)));
    }

    @PostMapping("/add")
    @Operation(summary = "Add a roadmap item")
    public ResponseEntity<ApiResponse<LearningRoadmap>> addItem(@RequestBody Map<String, Object> body) {
        Long userId = securityUtils.getCurrentUserId();
        String title = (String) body.get("title");
        String description = (String) body.get("description");
        int weekNumber = body.containsKey("weekNumber") ? (int) body.get("weekNumber") : 1;
        String deadlineStr = (String) body.get("deadline");
        LocalDate deadline = deadlineStr != null ? LocalDate.parse(deadlineStr) : LocalDate.now().plusWeeks(weekNumber);
        return ResponseEntity.ok(ApiResponse.success(roadmapService.addItem(userId, title, description, weekNumber, deadline)));
    }
}

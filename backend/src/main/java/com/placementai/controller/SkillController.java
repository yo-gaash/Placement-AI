package com.placementai.controller;

import com.placementai.dto.request.SkillGapRequest;
import com.placementai.dto.response.ApiResponse;
import com.placementai.dto.response.SkillGapResponse;
import com.placementai.entity.Skill;
import com.placementai.service.SkillService;
import com.placementai.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
@Tag(name = "Skills", description = "Skill management and gap analysis")
public class SkillController {

    private final SkillService skillService;
    private final SecurityUtils securityUtils;

    @PostMapping("/add")
    @Operation(summary = "Add a skill")
    public ResponseEntity<ApiResponse<Skill>> addSkill(@RequestBody Map<String, String> body) {
        Long userId = securityUtils.getCurrentUserId();
        String skillName = body.get("skillName");
        String level = body.getOrDefault("level", "BEGINNER");
        return ResponseEntity.ok(ApiResponse.success(skillService.addSkill(userId, skillName, level)));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user skills")
    public ResponseEntity<ApiResponse<List<Skill>>> getSkills() {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(skillService.getUserSkills(userId)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a skill")
    public ResponseEntity<ApiResponse<Void>> deleteSkill(@PathVariable Long id) {
        skillService.deleteSkill(id);
        return ResponseEntity.ok(ApiResponse.success("Skill deleted", null));
    }

    @PostMapping("/gap-analysis")
    @Operation(summary = "Run AI skill gap analysis and generate roadmap")
    public ResponseEntity<ApiResponse<SkillGapResponse>> analyzeGap(@RequestBody SkillGapRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(skillService.analyzeSkillGap(userId, request)));
    }
}

package com.placementai.dto.request;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillGapRequest {
    private String targetRole;
    private List<String> currentSkills;
}

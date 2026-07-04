package com.placementai.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeResponse {
    private Long id;
    private String resumeUrl;
    private Integer atsScore;
    private String feedback;
    private LocalDateTime uploadedAt;
}

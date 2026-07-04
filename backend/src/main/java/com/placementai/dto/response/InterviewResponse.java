package com.placementai.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewResponse {
    private Long id;
    private String interviewType;
    private String question;
    private String answer;
    private Integer score;
    private String feedback;
}

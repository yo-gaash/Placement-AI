package com.placementai.dto.request;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewAnswerRequest {
    private Long interviewHistoryId;
    private String answer;
}

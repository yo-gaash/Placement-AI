package com.placementai.dto.request;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    private String prompt;
    private String agentType; // GENERAL, RESUME_COACH, INTERVIEW_COACH, CODING_MENTOR
}

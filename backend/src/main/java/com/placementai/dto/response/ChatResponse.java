package com.placementai.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private Long id;
    private String prompt;
    private String response;
    private String agentType;
    private LocalDateTime createdAt;
}

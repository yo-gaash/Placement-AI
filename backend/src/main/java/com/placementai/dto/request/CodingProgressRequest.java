package com.placementai.dto.request;

import com.placementai.entity.CodingProgress;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodingProgressRequest {
    private String problemName;
    private CodingProgress.Difficulty difficulty;
    private String topic;
    private String problemUrl;
    private CodingProgress.Status status;
}

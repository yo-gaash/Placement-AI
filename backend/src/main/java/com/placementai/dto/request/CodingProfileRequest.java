package com.placementai.dto.request;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodingProfileRequest {
    private String leetcodeUrl;
    private String gfgUrl;
    private String githubUrl;
}

package com.placementai.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coding_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodingProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    private String leetcodeUrl;
    private String gfgUrl;
    private String githubUrl;
}

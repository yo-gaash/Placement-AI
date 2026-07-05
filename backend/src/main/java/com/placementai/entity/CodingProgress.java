package com.placementai.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coding_progress")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodingProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(nullable = false)
    private String problemName;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    private String topic;

    private String problemUrl;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.TODO;

    public enum Difficulty {
        EASY, MEDIUM, HARD
    }

    public enum Status {
        TODO, IN_PROGRESS, SOLVED
    }
}

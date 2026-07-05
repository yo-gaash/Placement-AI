package com.placementai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    private String agentType;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String prompt;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String response;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}

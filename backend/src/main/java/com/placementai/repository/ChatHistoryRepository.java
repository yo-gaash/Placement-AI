package com.placementai.repository;

import com.placementai.entity.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    List<ChatHistory> findByUserIdOrderByCreatedAtAsc(Long userId);
    List<ChatHistory> findByUserIdAndAgentTypeOrderByCreatedAtAsc(Long userId, String agentType);
}

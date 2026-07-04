package com.placementai.repository;

import com.placementai.entity.InterviewHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewHistoryRepository extends JpaRepository<InterviewHistory, Long> {
    List<InterviewHistory> findByUserId(Long userId);
    List<InterviewHistory> findByUserIdAndInterviewType(Long userId, String interviewType);
    long countByUserId(Long userId);
}

package com.placementai.repository;

import com.placementai.entity.CodingProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodingProgressRepository extends JpaRepository<CodingProgress, Long> {
    List<CodingProgress> findByUserId(Long userId);
    List<CodingProgress> findByUserIdAndStatus(Long userId, CodingProgress.Status status);
    long countByUserIdAndStatus(Long userId, CodingProgress.Status status);
    long countByUserId(Long userId);
}

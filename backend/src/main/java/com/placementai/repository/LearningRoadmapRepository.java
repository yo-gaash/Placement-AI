package com.placementai.repository;

import com.placementai.entity.LearningRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningRoadmapRepository extends JpaRepository<LearningRoadmap, Long> {
    List<LearningRoadmap> findByUserIdOrderByWeekNumberAsc(Long userId);
    long countByUserIdAndCompleted(Long userId, boolean completed);
    long countByUserId(Long userId);
}

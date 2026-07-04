package com.placementai.repository;

import com.placementai.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    Optional<Resume> findTopByUserIdOrderByUploadedAtDesc(Long userId);
    List<Resume> findByUserId(Long userId);
}

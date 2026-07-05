package com.placementai.repository;

import com.placementai.entity.CodingProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodingProfileRepository extends JpaRepository<CodingProfile, Long> {
    Optional<CodingProfile> findByUserId(Long userId);
}

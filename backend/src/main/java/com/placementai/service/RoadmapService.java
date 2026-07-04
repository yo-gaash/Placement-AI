package com.placementai.service;

import com.placementai.entity.LearningRoadmap;
import com.placementai.entity.User;
import com.placementai.exception.ResourceNotFoundException;
import com.placementai.repository.LearningRoadmapRepository;
import com.placementai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoadmapService {

    private final LearningRoadmapRepository roadmapRepository;
    private final UserRepository userRepository;

    public List<LearningRoadmap> getRoadmap(Long userId) {
        return roadmapRepository.findByUserIdOrderByWeekNumberAsc(userId);
    }

    public LearningRoadmap markCompleted(Long itemId, boolean completed) {
        LearningRoadmap item = roadmapRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap item", itemId));
        item.setCompleted(completed);
        return roadmapRepository.save(item);
    }

    public LearningRoadmap addItem(Long userId, String title, String description, int weekNumber, LocalDate deadline) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        LearningRoadmap item = LearningRoadmap.builder()
                .user(user)
                .title(title)
                .description(description)
                .weekNumber(weekNumber)
                .deadline(deadline)
                .completed(false)
                .build();
        return roadmapRepository.save(item);
    }
}

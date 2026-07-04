package com.placementai.service;

import com.placementai.dto.response.DashboardResponse;
import com.placementai.entity.CodingProgress;
import com.placementai.entity.InterviewHistory;
import com.placementai.entity.User;
import com.placementai.exception.ResourceNotFoundException;
import com.placementai.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.OptionalDouble;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final CodingProgressRepository codingProgressRepository;
    private final InterviewHistoryRepository interviewHistoryRepository;
    private final LearningRoadmapRepository roadmapRepository;
    private final SkillRepository skillRepository;

    public DashboardResponse getDashboard(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Resume ATS score
        Integer atsScore = resumeRepository.findTopByUserIdOrderByUploadedAtDesc(userId)
                .map(r -> r.getAtsScore())
                .orElse(null);

        // Coding stats
        long totalProblems = codingProgressRepository.countByUserId(userId);
        long solvedProblems = codingProgressRepository.countByUserIdAndStatus(userId, CodingProgress.Status.SOLVED);

        // Interview stats
        long totalInterviews = interviewHistoryRepository.countByUserId(userId);
        OptionalDouble avgScore = interviewHistoryRepository.findByUserId(userId)
                .stream()
                .filter(h -> h.getScore() != null)
                .mapToInt(InterviewHistory::getScore)
                .average();
        double avgInterviewScore = avgScore.isPresent() ? Math.round(avgScore.getAsDouble() * 10.0) / 10.0 : 0.0;

        // Roadmap stats
        long completedRoadmapItems = roadmapRepository.countByUserIdAndCompleted(userId, true);
        long totalRoadmapItems = roadmapRepository.countByUserId(userId);

        // Skills count
        long totalSkills = skillRepository.findByUserId(userId).size();

        return DashboardResponse.builder()
                .userName(user.getName())
                .atsScore(atsScore)
                .totalProblems(totalProblems)
                .solvedProblems(solvedProblems)
                .totalInterviews(totalInterviews)
                .avgInterviewScore(avgInterviewScore)
                .completedRoadmapItems(completedRoadmapItems)
                .totalRoadmapItems(totalRoadmapItems)
                .totalSkills(totalSkills)
                .build();
    }
}

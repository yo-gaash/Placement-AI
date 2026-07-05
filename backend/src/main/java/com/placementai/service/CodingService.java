package com.placementai.service;

import com.placementai.ai.CodingMentorAgent;
import com.placementai.dto.request.CodingProgressRequest;
import com.placementai.entity.*;
import com.placementai.exception.ResourceNotFoundException;
import com.placementai.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CodingService {

    private final CodingProgressRepository codingProgressRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final CodingMentorAgent codingMentorAgent;

    public CodingProgress addProblem(Long userId, CodingProgressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        CodingProgress progress = CodingProgress.builder()
                .user(user)
                .problemName(request.getProblemName())
                .difficulty(request.getDifficulty())
                .topic(request.getTopic())
                .status(request.getStatus() != null ? request.getStatus() : CodingProgress.Status.TODO)
                .build();
        return codingProgressRepository.save(progress);
    }

    public CodingProgress updateStatus(Long progressId, String status) {
        CodingProgress progress = codingProgressRepository.findById(progressId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", progressId));
        try {
            progress.setStatus(CodingProgress.Status.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }
        return codingProgressRepository.save(progress);
    }

    public List<CodingProgress> getUserProblems(Long userId) {
        return codingProgressRepository.findByUserId(userId);
    }

    public List<CodingMentorAgent.ProblemRecommendation> getNextRecommendations(Long userId) {
        List<String> solvedProblems = codingProgressRepository
                .findByUserIdAndStatus(userId, CodingProgress.Status.SOLVED)
                .stream()
                .map(CodingProgress::getProblemName)
                .collect(Collectors.toList());

        List<CodingProgress> allProblems = codingProgressRepository.findByUserId(userId);
        String currentTopic = allProblems.isEmpty() ? "Data Structures" :
                allProblems.get(allProblems.size() - 1).getTopic();

        return codingMentorAgent.getNextProblems(solvedProblems, currentTopic);
    }

    public String getTodaysPlan(Long userId) {
        List<String> skills = skillRepository.findByUserId(userId)
                .stream()
                .map(Skill::getSkillName)
                .collect(Collectors.toList());
        if (skills.isEmpty()) skills = List.of("Java", "Data Structures");

        long solved = codingProgressRepository.countByUserIdAndStatus(userId, CodingProgress.Status.SOLVED);
        long total = codingProgressRepository.countByUserId(userId);

        return codingMentorAgent.getTodaysPlan(skills, (int) solved, (int) total);
    }
}

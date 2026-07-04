package com.placementai.service;

import com.placementai.ai.SkillGapAgent;
import com.placementai.dto.request.SkillGapRequest;
import com.placementai.dto.response.SkillGapResponse;
import com.placementai.entity.*;
import com.placementai.exception.ResourceNotFoundException;
import com.placementai.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;
    private final UserRepository userRepository;
    private final SkillGapAgent skillGapAgent;
    private final LearningRoadmapRepository roadmapRepository;

    public Skill addSkill(Long userId, String skillName, String levelStr) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Skill.Level level;
        try {
            level = Skill.Level.valueOf(levelStr.toUpperCase());
        } catch (Exception e) {
            level = Skill.Level.BEGINNER;
        }

        Skill skill = Skill.builder()
                .user(user)
                .skillName(skillName)
                .level(level)
                .build();
        return skillRepository.save(skill);
    }

    public List<Skill> getUserSkills(Long userId) {
        return skillRepository.findByUserId(userId);
    }

    public void deleteSkill(Long skillId) {
        skillRepository.deleteById(skillId);
    }

    public SkillGapResponse analyzeSkillGap(Long userId, SkillGapRequest request) {
        List<Skill> userSkills = skillRepository.findByUserId(userId);
        List<String> currentSkillNames = userSkills.stream()
                .map(Skill::getSkillName)
                .collect(Collectors.toList());

        List<String> inputSkills = request.getCurrentSkills() != null && !request.getCurrentSkills().isEmpty()
                ? request.getCurrentSkills()
                : currentSkillNames;

        SkillGapAgent.SkillGapResult result = skillGapAgent.analyzeSkillGap(request.getTargetRole(), inputSkills);

        // Save roadmap to DB
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (result.getRoadmap() != null) {
            List<LearningRoadmap> roadmapItems = result.getRoadmap().stream()
                    .map(item -> LearningRoadmap.builder()
                            .user(user)
                            .title(item.getTopic())
                            .description(item.getDescription())
                            .weekNumber(item.getWeek())
                            .deadline(LocalDate.now().plusWeeks(item.getWeek()))
                            .completed(false)
                            .build())
                    .collect(Collectors.toList());
            roadmapRepository.saveAll(roadmapItems);
        }

        List<SkillGapResponse.RoadmapWeek> roadmapWeeks = result.getRoadmap() == null ? List.of() :
                result.getRoadmap().stream()
                        .map(item -> SkillGapResponse.RoadmapWeek.builder()
                                .week(item.getWeek())
                                .topic(item.getTopic())
                                .description(item.getDescription())
                                .build())
                        .collect(Collectors.toList());

        return SkillGapResponse.builder()
                .targetRole(request.getTargetRole())
                .presentSkills(inputSkills)
                .missingSkills(result.getMissingSkills())
                .roadmap(roadmapWeeks)
                .build();
    }
}

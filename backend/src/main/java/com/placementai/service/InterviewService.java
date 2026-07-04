package com.placementai.service;

import com.placementai.ai.InterviewAgent;
import com.placementai.dto.request.InterviewAnswerRequest;
import com.placementai.dto.response.InterviewResponse;
import com.placementai.entity.InterviewHistory;
import com.placementai.entity.User;
import com.placementai.exception.ResourceNotFoundException;
import com.placementai.repository.InterviewHistoryRepository;
import com.placementai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewHistoryRepository interviewHistoryRepository;
    private final UserRepository userRepository;
    private final InterviewAgent interviewAgent;

    public InterviewResponse startInterview(Long userId, String interviewType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        List<String> previousQuestions = interviewHistoryRepository
                .findByUserIdAndInterviewType(userId, interviewType)
                .stream()
                .map(InterviewHistory::getQuestion)
                .collect(Collectors.toList());

        String question = interviewAgent.generateQuestion(interviewType, previousQuestions);

        InterviewHistory history = InterviewHistory.builder()
                .user(user)
                .interviewType(interviewType)
                .question(question)
                .build();
        history = interviewHistoryRepository.save(history);

        return mapToResponse(history);
    }

    public InterviewResponse submitAnswer(Long userId, InterviewAnswerRequest request) {
        InterviewHistory history = interviewHistoryRepository.findById(request.getInterviewHistoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Interview session not found"));

        InterviewAgent.InterviewFeedback feedback = interviewAgent.evaluateAnswer(
                history.getQuestion(), request.getAnswer(), history.getInterviewType());

        history.setAnswer(request.getAnswer());
        history.setScore(feedback.getScore());
        history.setFeedback(feedback.getFeedback());
        history = interviewHistoryRepository.save(history);

        return mapToResponse(history);
    }

    public List<InterviewResponse> getHistory(Long userId) {
        return interviewHistoryRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<InterviewResponse> getHistoryByType(Long userId, String type) {
        return interviewHistoryRepository.findByUserIdAndInterviewType(userId, type)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private InterviewResponse mapToResponse(InterviewHistory h) {
        return InterviewResponse.builder()
                .id(h.getId())
                .interviewType(h.getInterviewType())
                .question(h.getQuestion())
                .answer(h.getAnswer())
                .score(h.getScore())
                .feedback(h.getFeedback())
                .build();
    }
}

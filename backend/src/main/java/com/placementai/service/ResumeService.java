package com.placementai.service;

import com.placementai.ai.ResumeAgent;
import com.placementai.dto.response.ResumeResponse;
import com.placementai.entity.Resume;
import com.placementai.entity.User;
import com.placementai.exception.ResourceNotFoundException;
import com.placementai.repository.ResumeRepository;
import com.placementai.repository.UserRepository;
import com.placementai.util.PdfExtractor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final PdfExtractor pdfExtractor;
    private final ResumeAgent resumeAgent;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public ResumeResponse uploadAndAnalyze(Long userId, MultipartFile file, String targetRole) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Extract text
        String resumeText = pdfExtractor.extractText(file);

        // Save file to disk
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String extension = "";
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID() + extension;
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);

        // Analyze with AI
        ResumeAgent.ResumeAnalysisResult result = resumeAgent.analyzeResume(resumeText, targetRole);

        // Build feedback string
        String feedbackJson = String.format(
            "{\"atsScore\":%d,\"presentKeywords\":%s,\"missingKeywords\":%s,\"suggestions\":%s,\"overallFeedback\":\"%s\"}",
            result.getAtsScore(),
            result.getPresentKeywords(),
            result.getMissingKeywords(),
            result.getSuggestions(),
            (result.getOverallFeedback() != null ? result.getOverallFeedback().replace("\"", "'") : "")
        );

        Resume resume = Resume.builder()
                .user(user)
                .resumeUrl(uploadDir + filename)
                .resumeText(resumeText)
                .atsScore(result.getAtsScore())
                .feedback(feedbackJson)
                .build();

        resume = resumeRepository.save(resume);
        return mapToResponse(resume);
    }

    public ResumeResponse getLatestResume(Long userId) {
        Resume resume = resumeRepository.findTopByUserIdOrderByUploadedAtDesc(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No resume found for user"));
        return mapToResponse(resume);
    }

    public List<ResumeResponse> getAllResumes(Long userId) {
        return resumeRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ResumeResponse mapToResponse(Resume resume) {
        return ResumeResponse.builder()
                .id(resume.getId())
                .resumeUrl(resume.getResumeUrl())
                .atsScore(resume.getAtsScore())
                .feedback(resume.getFeedback())
                .uploadedAt(resume.getUploadedAt())
                .build();
    }

    public List<ResumeAgent.JobMatch> getJobMatches(Long userId) {
        Resume resume = resumeRepository.findTopByUserIdOrderByUploadedAtDesc(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No resume found for user"));
        return resumeAgent.matchJobs(resume.getResumeText());
    }
}

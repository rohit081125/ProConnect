package com.proconnect.backend.service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.proconnect.backend.model.Work;
import com.proconnect.backend.repository.WorkRepository;

@Service
public class WorkService {

    private final WorkRepository workRepository;
    private final CloudinaryService cloudinaryService;

    public WorkService(WorkRepository workRepository, CloudinaryService cloudinaryService) {
        this.workRepository = workRepository;
        this.cloudinaryService = cloudinaryService;
    }

    public Work createWork(
            String title,
            String shortDescription,
            String fullDescription,
            String category,
            String skills,
            Double budget,
            String deadline,
            String projectLevel,
            String workType,
            String postedBy,
            MultipartFile image
    ) {
        Work work = new Work();

        work.setTitle(title);
        work.setShortDescription(shortDescription);
        work.setFullDescription(fullDescription);
        work.setCategory(category);
        work.setSkills(parseSkills(skills));
        work.setBudget(budget);
        work.setProjectLevel(projectLevel);
        work.setWorkType(workType);
        work.setPostedBy(postedBy);
        work.setCreatedAt(LocalDateTime.now());

        if (deadline != null && !deadline.isBlank()) {
            work.setDeadline(java.time.LocalDate.parse(deadline).atStartOfDay());
        }

        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService.uploadWorkImage(image);
            work.setImageUrl(imageUrl);
        }

        return workRepository.save(work);
    }

    public List<Work> getAllWorks() {
        return workRepository.findAll();
    }

    public List<Work> getWorksByUser(String userId) {
        return workRepository.findByPostedBy(userId);
    }

    public Work getWorkById(String id) {
        return workRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Work not found"));
    }

    public void deleteWork(String id) {
        if (!workRepository.existsById(id)) {
            throw new RuntimeException("Work not found");
        }
        workRepository.deleteById(id);
    }

    private List<String> parseSkills(String skills) {
        if (skills == null || skills.isBlank()) {
            return Collections.emptyList();
        }

        return Arrays.stream(skills.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}
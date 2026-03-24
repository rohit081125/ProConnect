package com.proconnect.backend.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.proconnect.backend.model.Work;
import com.proconnect.backend.service.WorkService;

@RestController
@RequestMapping("/api/works")
@CrossOrigin(origins = "*")
public class WorkController {

    private final WorkService workService;

    public WorkController(WorkService workService) {
        this.workService = workService;
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Work createWork(
            @RequestParam("title") String title,
            @RequestParam("shortDescription") String shortDescription,
            @RequestParam("fullDescription") String fullDescription,
            @RequestParam("category") String category,
            @RequestParam(value = "skills", required = false) String skills,
            @RequestParam("budget") Double budget,
            @RequestParam(value = "deadline", required = false) String deadline,
            @RequestParam("projectLevel") String projectLevel,
            @RequestParam("workType") String workType,
            @RequestParam("postedBy") String postedBy,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        return workService.createWork(
                title,
                shortDescription,
                fullDescription,
                category,
                skills,
                budget,
                deadline,
                projectLevel,
                workType,
                postedBy,
                image
        );
    }

    @GetMapping
    public List<Work> getAllWorks() {
        return workService.getAllWorks();
    }

    @GetMapping("/{id}")
    public Work getWorkById(@PathVariable String id) {
        return workService.getWorkById(id);
    }

    @GetMapping("/user/{userId}")
    public List<Work> getWorksByUser(@PathVariable String userId) {
        return workService.getWorksByUser(userId);
    }

    @DeleteMapping("/{id}")
    public String deleteWork(@PathVariable String id) {
        workService.deleteWork(id);
        return "Work deleted successfully";
    }
}
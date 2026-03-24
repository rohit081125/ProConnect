package com.proconnect.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.*;

import com.proconnect.backend.dto.CreateProjectRequest;
import com.proconnect.backend.model.Project;
import com.proconnect.backend.service.ProjectService;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public Project createProject(@RequestBody CreateProjectRequest request) {
        return projectService.createProject(request);
    }

    @GetMapping
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }

    @GetMapping("/{id}")
    public Project getProjectById(@PathVariable String id) {
        Optional<Project> project = projectService.getProjectById(id);
        return project.orElse(null);
    }
    @GetMapping("/user/{userId}")
    public List<Project> getProjectsByUserId(@PathVariable String userId) {
        return projectService.getProjectsByUserId(userId);
    }
    @DeleteMapping("/{id}")
    public String deleteProject(@PathVariable String id) {
        return projectService.deleteProject(id);
    }
}
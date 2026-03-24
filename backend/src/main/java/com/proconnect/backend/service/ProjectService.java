package com.proconnect.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.proconnect.backend.dto.CreateProjectRequest;
import com.proconnect.backend.model.Project;
import com.proconnect.backend.repository.ProjectRepository;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    private static final Set<String> ALLOWED_CATEGORIES = Set.of(
            "Web Development",
            "Design",
            "Data Science",
            "Content & Marketing",
            "DevOps",
            "Backend Development",
            "Mobile Development",
            "Blockchain",
            "AI & Machine Learning",
            "Video & Animation"
    );

    private static final Set<String> ALLOWED_URGENCY = Set.of(
            "Low",
            "Medium",
            "High"
    );

    private static final Set<String> ALLOWED_WORK_TYPE = Set.of(
            "Remote",
            "On-site",
            "Hybrid"
    );

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public Project createProject(CreateProjectRequest request) {
        validateProjectRequest(request);

        Project project = new Project();
        project.setTitle(request.getTitle());
        project.setCategory(request.getCategory());
        project.setShortDescription(request.getShortDescription());
        project.setDetailedDescription(request.getDetailedDescription());
        project.setRequiredSkills(request.getRequiredSkills());
        project.setBudgetMin(request.getBudgetMin());
        project.setBudgetMax(request.getBudgetMax());
        project.setDeadline(request.getDeadline());
        project.setUrgency(request.getUrgency());
        project.setWorkType(request.getWorkType());
        project.setLocation(request.getLocation());
        project.setPostedBy(request.getPostedBy());

        return projectRepository.save(project);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Optional<Project> getProjectById(String id) {
        return projectRepository.findById(id);
    }

    private void validateProjectRequest(CreateProjectRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Title is required");
        }

        if (request.getCategory() == null || !ALLOWED_CATEGORIES.contains(request.getCategory())) {
            throw new RuntimeException("Invalid category");
        }

        if (request.getShortDescription() == null || request.getShortDescription().trim().isEmpty()) {
            throw new RuntimeException("Short description is required");
        }

        if (request.getDetailedDescription() == null || request.getDetailedDescription().trim().isEmpty()) {
            throw new RuntimeException("Detailed description is required");
        }

        if (request.getRequiredSkills() == null || request.getRequiredSkills().isEmpty()) {
            throw new RuntimeException("At least one required skill is needed");
        }

        if (request.getBudgetMin() < 0 || request.getBudgetMax() < 0 || request.getBudgetMin() > request.getBudgetMax()) {
            throw new RuntimeException("Invalid budget range");
        }

        if (request.getDeadline() == null) {
            throw new RuntimeException("Deadline is required");
        }

        if (request.getUrgency() == null || !ALLOWED_URGENCY.contains(request.getUrgency())) {
            throw new RuntimeException("Invalid urgency");
        }

        if (request.getWorkType() == null || !ALLOWED_WORK_TYPE.contains(request.getWorkType())) {
            throw new RuntimeException("Invalid work type");
        }

        if (request.getPostedBy() == null || request.getPostedBy().trim().isEmpty()) {
            throw new RuntimeException("postedBy is required");
        }
    }
    public List<Project> getProjectsByUserId(String userId) {
        return projectRepository.findByPostedBy(userId);
    }
    public String deleteProject(String projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        projectRepository.delete(project);
        return "Project deleted successfully";
    }
}
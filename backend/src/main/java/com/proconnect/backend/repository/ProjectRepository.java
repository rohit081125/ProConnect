package com.proconnect.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.proconnect.backend.model.Project;

public interface ProjectRepository extends MongoRepository<Project, String> {
    List<Project> findByPostedBy(String postedBy);
    long countByPostedBy(String postedBy);
}
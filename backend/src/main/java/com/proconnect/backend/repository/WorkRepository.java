package com.proconnect.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.proconnect.backend.model.Work;

@Repository
public interface WorkRepository extends MongoRepository<Work, String> {
    List<Work> findByPostedBy(String postedBy);
}
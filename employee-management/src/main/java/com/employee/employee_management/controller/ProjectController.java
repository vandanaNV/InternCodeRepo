package com.employee.employee_management.controller;

import com.employee.employee_management.model.Project;
import com.employee.employee_management.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProjectController {

    private final ProjectRepository projectRepository;

    @GetMapping
    public ResponseEntity<List<Project>> getAll() {
        return ResponseEntity.ok(projectRepository.findAll());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Project>> getByEmployee(
            @PathVariable Long employeeId) {
        return ResponseEntity.ok(
                projectRepository.findByEmployeeId(employeeId));
    }

    @PostMapping
    public ResponseEntity<Project> addProject(
            @RequestBody Project project) {
        return ResponseEntity.ok(
                projectRepository.save(project));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(
            @PathVariable Long id,
            @RequestBody Project project) {
        Project existing = projectRepository.findById(id).orElseThrow();
        existing.setProjectName(project.getProjectName());
        existing.setDescription(project.getDescription());
        existing.setStartDate(project.getStartDate());
        existing.setDeadline(project.getDeadline());
        existing.setStatus(project.getStatus());
        return ResponseEntity.ok(projectRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
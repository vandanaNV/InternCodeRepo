package com.employee.employee_management.controller;

import com.employee.employee_management.model.AttendanceRegularization;
import com.employee.employee_management.repository.AttendanceRegularizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/regularization")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AttendanceRegularizationController {

    private final AttendanceRegularizationRepository regularizationRepository;

    // Employee apni request dekhe
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AttendanceRegularization>> getByEmployee(
            @PathVariable Long employeeId) {
        return ResponseEntity.ok(
                regularizationRepository.findByEmployeeId(employeeId));
    }

    // Nai request bhejo
    @PostMapping
    public ResponseEntity<AttendanceRegularization> addRequest(
            @RequestBody AttendanceRegularization request) {
        request.setStatus("PENDING");
        return ResponseEntity.ok(
                regularizationRepository.save(request));
    }

    // Sab requests dekho (Admin ke liye)
    @GetMapping
    public ResponseEntity<List<AttendanceRegularization>> getAll() {
        return ResponseEntity.ok(
                regularizationRepository.findAll());
    }

    // Approve karo
    @PutMapping("/{id}/approve")
    public ResponseEntity<AttendanceRegularization> approve(
            @PathVariable Long id) {
        AttendanceRegularization req = regularizationRepository.findById(id)
                .orElseThrow();
        req.setStatus("APPROVED");
        return ResponseEntity.ok(
                regularizationRepository.save(req));
    }

    // Reject karo
    @PutMapping("/{id}/reject")
    public ResponseEntity<AttendanceRegularization> reject(
            @PathVariable Long id) {
        AttendanceRegularization req = regularizationRepository.findById(id)
                .orElseThrow();
        req.setStatus("REJECTED");
        return ResponseEntity.ok(
                regularizationRepository.save(req));
    }
}
package com.employee.employee_management.controller;

import com.employee.employee_management.model.Timesheet;
import com.employee.employee_management.repository.TimesheetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/timesheet")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TimesheetController {

    private final TimesheetRepository timesheetRepository;

    // Employee apna timesheet dekhe
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Timesheet>> getByEmployee(
            @PathVariable Long employeeId) {
        return ResponseEntity.ok(
                timesheetRepository.findByEmployeeId(employeeId));
    }

    // Timesheet entry add karo
    @PostMapping
    public ResponseEntity<Timesheet> addTimesheet(
            @RequestBody Timesheet timesheet) {
        return ResponseEntity.ok(
                timesheetRepository.save(timesheet));
    }

    // Sab timesheets dekho (Admin ke liye)
    @GetMapping
    public ResponseEntity<List<Timesheet>> getAll() {
        return ResponseEntity.ok(
                timesheetRepository.findAll());
    }

    // Delete karo
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        timesheetRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
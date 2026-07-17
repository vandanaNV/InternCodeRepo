package com.employee.employee_management.controller;

import com.employee.employee_management.model.Holiday;
import com.employee.employee_management.repository.HolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/holidays")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HolidayController {

    private final HolidayRepository holidayRepository;

    // Sab holidays dekho (Admin + Employee dono use kar sakte hain)
    @GetMapping
    public ResponseEntity<List<Holiday>> getAllHolidays() {
        return ResponseEntity.ok(holidayRepository.findAll());
    }

    // Naya holiday add karo (Admin only)
    @PostMapping
    public ResponseEntity<Holiday> addHoliday(@RequestBody Holiday holiday) {
        return ResponseEntity.ok(holidayRepository.save(holiday));
    }

    // Holiday delete karo (Admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHoliday(@PathVariable Long id) {
        holidayRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
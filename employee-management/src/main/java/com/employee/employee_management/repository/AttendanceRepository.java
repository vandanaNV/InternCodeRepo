package com.employee.employee_management.repository;

import com.employee.employee_management.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByEmployeeId(Long employeeId);
    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);
    List<Attendance> findByDateAndStatus(LocalDate date, String status);
    List<Attendance> findByDateBetween(LocalDate start, LocalDate end);

}
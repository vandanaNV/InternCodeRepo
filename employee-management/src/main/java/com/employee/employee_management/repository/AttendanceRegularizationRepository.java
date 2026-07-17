package com.employee.employee_management.repository;

import com.employee.employee_management.model.AttendanceRegularization;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttendanceRegularizationRepository extends JpaRepository<AttendanceRegularization, Long> {
    List<AttendanceRegularization> findByEmployeeId(Long employeeId);
}
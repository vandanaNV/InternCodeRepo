package com.employee.employee_management.security;

import com.employee.employee_management.model.Attendance;
import com.employee.employee_management.model.Employee;
import com.employee.employee_management.model.LeaveRequest;
import com.employee.employee_management.repository.AttendanceRepository;
import com.employee.employee_management.repository.EmployeeRepository;
import com.employee.employee_management.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/employee")
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    // Profile
    @GetMapping("/profile/{employeeId}")
    public ResponseEntity<?> getProfile(@PathVariable Long employeeId) {
        Optional<Employee> employee = employeeRepository.findById(employeeId);
        if (employee.isPresent()) return ResponseEntity.ok(employee.get());
        return ResponseEntity.status(404).body("Employee not found!");
    }
    // Update Profile Photo
    @PutMapping("/profile/{employeeId}/photo")
    public ResponseEntity<?> updatePhoto(@PathVariable Long employeeId, @RequestBody Map<String, String> request) {
        Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
        if (employeeOpt.isEmpty()) return ResponseEntity.status(404).body("Employee not found!");
        Employee employee = employeeOpt.get();
        employee.setProfilePhoto(request.get("photo"));
        employeeRepository.save(employee);
        return ResponseEntity.ok("Photo updated successfully!");
    }
    // Salary
    @GetMapping("/salary/{employeeId}")
    public ResponseEntity<?> getSalary(@PathVariable Long employeeId) {
        Optional<Employee> employee = employeeRepository.findById(employeeId);
        if (employee.isPresent()) {
            return ResponseEntity.ok(Map.of(
                    "name", employee.get().getName(),
                    "salary", employee.get().getSalary()
            ));
        }
        return ResponseEntity.status(404).body("Employee not found!");
    }

    // Punch In
    @PostMapping("/attendance/punchin")
    public ResponseEntity<?> punchIn(@RequestBody Map<String, String> request) {
        Long empId = Long.parseLong(request.get("employeeId"));
        LocalDate today = LocalDate.now();

        Optional<Attendance> existing = attendanceRepository
                .findByEmployeeIdAndDate(empId, today);

        if (existing.isPresent()) {
            return ResponseEntity.status(400).body("Already punched in today!");
        }

        Attendance attendance = new Attendance();
        attendance.setEmployeeId(empId);
        attendance.setDate(today);
        attendance.setPunchIn(LocalTime.now());
        attendance.setStatus("PRESENT");
        attendanceRepository.save(attendance);
        return ResponseEntity.ok("Punch In recorded!");
    }

    // Punch Out
    @PutMapping("/attendance/punchout")
    public ResponseEntity<?> punchOut(@RequestBody Map<String, String> request) {
        Long empId = Long.parseLong(request.get("employeeId"));
        LocalDate today = LocalDate.now();

        Optional<Attendance> existing = attendanceRepository
                .findByEmployeeIdAndDate(empId, today);

        if (existing.isEmpty()) {
            return ResponseEntity.status(400).body("Punch in first!");
        }

        Attendance attendance = existing.get();
        attendance.setPunchOut(LocalTime.now());
        attendanceRepository.save(attendance);
        return ResponseEntity.ok("Punch Out recorded!");
    }

    // Get Attendance
    @GetMapping("/attendance/{employeeId}")
    public ResponseEntity<?> getAttendance(@PathVariable Long employeeId) {
        List<Attendance> list = attendanceRepository.findByEmployeeId(employeeId);
        return ResponseEntity.ok(list);
    }

    // Apply Leave
    @PostMapping("/leave")
    public ResponseEntity<?> applyLeave(@RequestBody Map<String, String> request) {
        LeaveRequest leave = new LeaveRequest();
        leave.setEmployeeId(Long.parseLong(request.get("employeeId")));
        leave.setFromDate(LocalDate.parse(request.get("fromDate")));
        leave.setToDate(LocalDate.parse(request.get("toDate")));
        leave.setReason(request.get("reason"));
        leave.setStatus("PENDING");
        leaveRequestRepository.save(leave);
        return ResponseEntity.ok("Leave request submitted!");
    }

    // Get Leaves
    @GetMapping("/leave/{employeeId}")
    public ResponseEntity<?> getLeaves(@PathVariable Long employeeId) {
        List<LeaveRequest> list = leaveRequestRepository.findByEmployeeId(employeeId);
        return ResponseEntity.ok(list);
    }
}
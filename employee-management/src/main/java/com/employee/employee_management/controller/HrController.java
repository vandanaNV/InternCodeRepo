package com.employee.employee_management.controller;

import com.employee.employee_management.model.Employee;
import com.employee.employee_management.model.User;
import com.employee.employee_management.security.UserService;
import com.employee.employee_management.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/hr")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HrController {

    private final EmployeeService employeeService;

    @Autowired
    private UserService userService;

    @GetMapping("/employees")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(
                employeeService.getAllEmployees());
    }

    @GetMapping("/employees/{id}")
    public ResponseEntity<Employee> getEmployee(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                employeeService.getEmployeeById(id));
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable Long id,
            @RequestBody Employee emp) {
        return ResponseEntity.ok(
                employeeService.updateEmployee(id, emp));
    }

    @PostMapping("/create-hr")
    public ResponseEntity<String> createHr(
            @RequestBody User user) {
        userService.registerUser(
                user.getUsername(),
                user.getPassword(),
                user.getEmployeeId(),
                "HR"
        );
        return ResponseEntity.ok("HR user created!");
    }
}
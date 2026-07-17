package com.employee.employee_management.security;

import com.employee.employee_management.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    private final String ADMIN_USERNAME = "admin";
    private final String ADMIN_PASSWORD = "143006";

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        // Admin check
        if (ADMIN_USERNAME.equals(username) && ADMIN_PASSWORD.equals(password)) {
            String token = jwtUtil.generateToken(username + ":ADMIN");
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("role", "ADMIN");
            return ResponseEntity.ok(response);
        }

        // HR check
        Optional<User> hrUser = userService.findByUsername(username);
        if (hrUser.isPresent() &&
                hrUser.get().getRole() == User.Role.HR &&
                userService.validateUser(username, password)) {
            String token = jwtUtil.generateToken(username + ":HR");
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("role", "HR");
            return ResponseEntity.ok(response);
        }

        // Employee check
        if (userService.validateUser(username, password)) {
            Optional<User> user = userService.findByUsername(username);
            String token = jwtUtil.generateToken(
                    username + ":EMPLOYEE:" + user.get().getEmployeeId());
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("role", "EMPLOYEE");
            response.put("employeeId",
                    String.valueOf(user.get().getEmployeeId()));
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body("Invalid credentials!");
    }

    // Register (Admin ya HR banane ke liye)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String role = request.getOrDefault("role", "EMPLOYEE");
        Long employeeId = null;
        if (request.get("employeeId") != null) {
            employeeId = Long.parseLong(request.get("employeeId"));
        }
        userService.registerUser(username, password, employeeId, role);
        return ResponseEntity.ok("User registered successfully!");
    }

    // Change Password
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        if (userService.validateUser(username, oldPassword)) {
            userService.changePassword(username, newPassword);
            return ResponseEntity.ok("Password changed!");
        }
        return ResponseEntity.status(400).body("Wrong current password!");
    }
}
package com.employee.employee_management.controller;

import com.employee.employee_management.repository.UserRepository;
import com.employee.employee_management.repository.EmployeeRepository;
import com.employee.employee_management.security.EmailService;
import com.employee.employee_management.security.OtpService;
import com.employee.employee_management.security.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/password")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PasswordResetController {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final OtpService otpService;
    private final UserService userService;
    private final EmployeeRepository employeeRepository;

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        boolean exists = employeeRepository.findAll()
                .stream()
                .anyMatch(e -> email.equals(e.getEmail()));
        if (!exists) {
            return ResponseEntity.badRequest().body("No account found with this email!");
        }
        String otp = otpService.generateOtp(email);
        emailService.sendOtp(email, otp);
        return ResponseEntity.ok("OTP sent to your email!");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        if (otpService.validateOtp(email, otp)) {
            return ResponseEntity.ok("OTP verified!");
        }
        return ResponseEntity.badRequest().body("Invalid or expired OTP!");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");
        if (!otpService.validateOtp(email, otp)) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP!");
        }
        employeeRepository.findAll().stream()
                .filter(e -> email.equals(e.getEmail()))
                .findFirst()
                .ifPresent(emp -> {
                    userRepository.findAll().stream()
                            .filter(u -> u.getEmployeeId() != null && u.getEmployeeId().equals(String.valueOf(emp.getId())))
                            .findFirst()
                            .ifPresent(u -> {
                                userService.changePassword(u.getUsername(), newPassword);
                                otpService.clearOtp(email);
                            });
                });
        return ResponseEntity.ok("Password reset successfully!");
    }
}
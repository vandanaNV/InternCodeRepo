package com.employee.employee_management.security;

import lombok.RequiredArgsConstructor;
import org.springframework.mail .SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtp(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Password Reset OTP - Employee Management System");
        message.setText("Your OTP for password reset is: " + otp +
                "\n\nThis OTP is valid for 10 minutes." +
                "\n\nIf you did not request this, please ignore this email.");
        mailSender.send(message);
    }
}
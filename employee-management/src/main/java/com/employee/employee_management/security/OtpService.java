package com.employee.employee_management.security;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OtpService {

    private final Map<String, String> otpStore = new HashMap<>();
    private final Map<String, Long> otpExpiry = new HashMap<>();

    public String generateOtp(String email) {
        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        otpStore.put(email, otp);
        otpExpiry.put(email, System.currentTimeMillis() + 10 * 60 * 1000); // 10 minutes
        return otp;
    }

    public boolean validateOtp(String email, String otp) {
        if (!otpStore.containsKey(email)) return false;
        if (System.currentTimeMillis() > otpExpiry.get(email)) {
            otpStore.remove(email);
            otpExpiry.remove(email);
            return false;
        }
        return otpStore.get(email).equals(otp);
    }

    public void clearOtp(String email) {
        otpStore.remove(email);
        otpExpiry.remove(email);
    }
}
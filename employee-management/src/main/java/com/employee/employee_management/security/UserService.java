package com.employee.employee_management.security;

import com.employee.employee_management.model.User;
import com.employee.employee_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public boolean validateUser(String username,
                                String password) {
        Optional<User> user =
                userRepository.findByUsername(username);
        return user.isPresent() &&
                user.get().getPassword().equals(password);
    }

    public Optional<User> findByUsername(
            String username) {
        return userRepository.findByUsername(username);
    }

    public void registerUser(String username,
                             String password, Long employeeId,
                             String role) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        user.setEmployeeId(employeeId);

        if ("HR".equalsIgnoreCase(role)) {
            user.setRole(User.Role.HR);
        } else {
            user.setRole(User.Role.EMPLOYEE);
        }
        userRepository.save(user);
    }

    public void changePassword(String username,
                               String newPassword) {
        Optional<User> user =
                userRepository.findByUsername(username);
        user.ifPresent(u -> {
            u.setPassword(newPassword);
            userRepository.save(u);
        });
    }
}
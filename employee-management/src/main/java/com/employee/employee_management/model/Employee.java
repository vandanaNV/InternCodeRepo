package com.employee.employee_management.model;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "employees")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank(message = "Name is required")
    @Column(name = "employee_name")
    private String name;
    @NotBlank(message = "Department is required")
    private String department;
    @NotBlank(message = "Designation is required")
    private String designation;
    @Email(message = "Invalid email")
    @NotBlank(message = "Email is required")
    @Column(unique = true)
    private String email;
    @NotBlank(message = "Mobile number is required")
    @Column(name = "mobile_number")
    private String mobileNumber;
    @NotNull(message = "Salary is required")
    private Double salary;
    @Column(name = "joining_date")
    private LocalDate joiningDate;
    // Education Details
    private String school10;
    private String percent10;
    private String school12;
    private String percent12;
    private String degree;
    private String college;
    private String cgpa;
    @Column(name = "profile_photo", columnDefinition = "LONGTEXT")
    private String profilePhoto;
}
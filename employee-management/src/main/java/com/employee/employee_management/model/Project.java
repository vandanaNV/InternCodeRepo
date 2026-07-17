package com.employee.employee_management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String projectName;

    private String description;

    private LocalDate startDate;

    private LocalDate deadline;

    private String status; // ONGOING, COMPLETED, ON_HOLD

    private Long employeeId;

    private String assignedBy;
}
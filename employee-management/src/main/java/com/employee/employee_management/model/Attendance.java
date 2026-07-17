package com.employee.employee_management.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;
    private LocalDate date;
    private String status;
    private LocalTime punchIn;
    private LocalTime punchOut;

    public Long getId() { return id; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalTime getPunchIn() { return punchIn; }
    public void setPunchIn(LocalTime punchIn) { this.punchIn = punchIn; }
    public LocalTime getPunchOut() { return punchOut; }
    public void setPunchOut(LocalTime punchOut) { this.punchOut = punchOut; }
}
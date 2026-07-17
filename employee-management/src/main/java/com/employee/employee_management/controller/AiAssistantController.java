package com.employee.employee_management.controller;

import com.employee.employee_management.model.Employee;
import com.employee.employee_management.model.LeaveRequest;
import com.employee.employee_management.repository.AttendanceRepository;
import com.employee.employee_management.repository.EmployeeRepository;
import com.employee.employee_management.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AiAssistantController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.api.url}")
    private String groqApiUrl;

    @PostMapping("/ai-assistant")
    public ResponseEntity<?> askAssistant(@RequestBody Map<String, String> request) {
        String userQuestion = request.get("question");

        String dataContext = buildDataContext();

        String systemPrompt = "You are a helpful HR/Admin assistant for an Employee Management System. "
                + "You help the Admin manage employees, attendance, and leave requests when there is no HR person available. "
                + "Use the following current company data to answer questions accurately. "
                + "If the question is a general question not related to the data, answer it normally. "
                + "Keep answers concise and clear.\n\n"
                + "CURRENT COMPANY DATA:\n" + dataContext;

        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);

            Map<String, Object> body = Map.of(
                    "model", "llama-3.3-70b-versatile",
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userQuestion)
                    )
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(groqApiUrl, entity, Map.class);

            List<Map> choices = (List<Map>) response.getBody().get("choices");
            Map firstChoice = choices.get(0);
            Map message = (Map) firstChoice.get("message");
            String answer = (String) message.get("content");

            return ResponseEntity.ok(Map.of("answer", answer));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("answer", "Sorry, I couldn't process that right now. Error: " + e.getMessage()));
        }
    }

    private String buildDataContext() {
        List<Employee> employees = employeeRepository.findAll();
        List<LeaveRequest> pendingLeaves = leaveRequestRepository.findByStatus("PENDING");
        long presentToday = attendanceRepository.findByDateAndStatus(LocalDate.now(), "PRESENT").size();

        StringBuilder sb = new StringBuilder();
        sb.append("Total Employees: ").append(employees.size()).append("\n");
        sb.append("Present Today: ").append(presentToday).append("\n");
        sb.append("Pending Leave Requests: ").append(pendingLeaves.size()).append("\n\n");

        sb.append("Employee List:\n");
        for (Employee e : employees) {
            sb.append("- ID ").append(e.getId())
                    .append(", Name: ").append(e.getName())
                    .append(", Department: ").append(e.getDepartment())
                    .append(", Designation: ").append(e.getDesignation())
                    .append(", Salary: ").append(e.getSalary())
                    .append("\n");
        }

        if (!pendingLeaves.isEmpty()) {
            sb.append("\nPending Leaves:\n");
            for (LeaveRequest l : pendingLeaves) {
                sb.append("- Employee ID ").append(l.getEmployeeId())
                        .append(", From: ").append(l.getFromDate())
                        .append(", To: ").append(l.getToDate())
                        .append(", Reason: ").append(l.getReason())
                        .append("\n");
            }
        }

        return sb.toString();
    }
}
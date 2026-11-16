package in.achyut.gatekeeper.api_management_service.controller;

import in.achyut.gatekeeper.api_management_service.dto.responseDto.ApiResponse;
import in.achyut.gatekeeper.api_management_service.dto.responseDto.AuditRecordResponse;
import in.achyut.gatekeeper.api_management_service.model.ControlPlaneAuditRecord;
import in.achyut.gatekeeper.api_management_service.repository.ControlPlaneAuditRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/audit-records")
@RequiredArgsConstructor
public class AuditController {

    private final ControlPlaneAuditRecordRepository auditRecordRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AuditRecordResponse>>> getRecentAuditRecords() {
        List<ControlPlaneAuditRecord> records = auditRecordRepository.findTop50ByOrderByCreatedAtDesc();
        List<AuditRecordResponse> responses = records.stream().map(r -> AuditRecordResponse.builder()
                .id(r.getId())
                .organizationId(r.getOrganization() != null ? r.getOrganization().getId() : null)
                .organizationName(r.getOrganization() != null ? r.getOrganization().getName() : null)
                .actor(r.getActor())
                .action(r.getAction())
                .resourceType(r.getResourceType())
                .resourceId(r.getResourceId())
                .correlationId(r.getCorrelationId())
                .durationMs(r.getDurationMs())
                .result(r.getResult())
                .details(r.getDetails())
                .createdAt(r.getCreatedAt())
                .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(responses));
    }
}


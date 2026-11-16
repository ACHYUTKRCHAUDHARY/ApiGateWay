package in.achyut.gatekeeper.api_management_service.service;

import in.achyut.gatekeeper.api_management_service.model.ControlPlaneAuditRecord;
import in.achyut.gatekeeper.api_management_service.model.Organization;
import in.achyut.gatekeeper.api_management_service.repository.ControlPlaneAuditRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final ControlPlaneAuditRecordRepository auditRecordRepository;

    public void record(String actor, String action, String resourceType, String resourceId,
                       String result, String details, Organization organization, long durationMs) {
        try {
            ControlPlaneAuditRecord record = ControlPlaneAuditRecord.builder()
                    .actor(actor != null ? actor : "system")
                    .action(action)
                    .resourceType(resourceType)
                    .resourceId(resourceId)
                    .correlationId(java.util.UUID.randomUUID().toString())
                    .result(result != null ? result : "SUCCESS")
                    .details(details)
                    .organization(organization)
                    .durationMs(durationMs)
                    .createdAt(LocalDateTime.now())
                    .build();

            auditRecordRepository.save(record);
        } catch (Exception e) {
            log.warn("Failed to save audit record: {}", e.getMessage());
        }
    }
}


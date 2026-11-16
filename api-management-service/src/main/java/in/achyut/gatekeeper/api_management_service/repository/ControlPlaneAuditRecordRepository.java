package in.achyut.gatekeeper.api_management_service.repository;

import in.achyut.gatekeeper.api_management_service.model.ControlPlaneAuditRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ControlPlaneAuditRecordRepository extends JpaRepository<ControlPlaneAuditRecord, Long> {

    List<ControlPlaneAuditRecord> findTop50ByOrderByCreatedAtDesc();

    Page<ControlPlaneAuditRecord> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId, Pageable pageable);

    Page<ControlPlaneAuditRecord> findAllByOrderByCreatedAtDesc(Pageable pageable);
}


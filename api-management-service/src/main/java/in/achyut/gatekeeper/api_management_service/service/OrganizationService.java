package in.achyut.gatekeeper.api_management_service.service;

import in.achyut.gatekeeper.api_management_service.dto.requestDto.CreateOrganizationRequest;
import in.achyut.gatekeeper.api_management_service.dto.requestDto.UpdateOrganizationRequest;
import in.achyut.gatekeeper.api_management_service.dto.responseDto.OrganizationResponse;
import in.achyut.gatekeeper.api_management_service.model.Organization;
import in.achyut.gatekeeper.api_management_service.repository.ApiRouteRepository;
import in.achyut.gatekeeper.api_management_service.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final ApiRouteRepository routeRepository;
    private final AuditService auditService;

    public List<OrganizationResponse> getAllOrganizations() {
        return organizationRepository.findAll().stream()
                .filter(org -> org.getDeletedAt() == null)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public OrganizationResponse getOrganizationById(Long id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found with ID: " + id));
        return toResponse(org);
    }

    @Transactional
    public OrganizationResponse createOrganization(CreateOrganizationRequest request, String actor) {
        long startTime = System.currentTimeMillis();

        if (organizationRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Organization name already exists: " + request.getName());
        }
        if (organizationRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Organization slug already exists: " + request.getSlug());
        }

        Organization org = Organization.builder()
                .name(request.getName())
                .slug(request.getSlug().toLowerCase().trim().replaceAll("[^a-z0-9-]", "-"))
                .status(request.getStatus() != null ? request.getStatus().toUpperCase() : "ACTIVE")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Organization saved = organizationRepository.save(org);

        auditService.record(actor, "CREATE_ORGANIZATION", "ORGANIZATION", saved.getId().toString(),
                "SUCCESS", "Created organization " + saved.getName(), saved, System.currentTimeMillis() - startTime);

        return toResponse(saved);
    }

    @Transactional
    public OrganizationResponse updateOrganization(Long id, UpdateOrganizationRequest request, String actor) {
        long startTime = System.currentTimeMillis();

        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found with ID: " + id));

        if (request.getName() != null && !request.getName().isBlank()) {
            org.setName(request.getName());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            org.setStatus(request.getStatus().toUpperCase());
        }
        org.setUpdatedAt(LocalDateTime.now());

        Organization saved = organizationRepository.save(org);

        auditService.record(actor, "UPDATE_ORGANIZATION", "ORGANIZATION", saved.getId().toString(),
                "SUCCESS", "Updated organization " + saved.getName(), saved, System.currentTimeMillis() - startTime);

        return toResponse(saved);
    }

    private OrganizationResponse toResponse(Organization org) {
        long routesCount = routeRepository.findByOrganizationId(org.getId()).size();
        return OrganizationResponse.builder()
                .id(org.getId())
                .name(org.getName())
                .slug(org.getSlug())
                .status(org.getStatus())
                .createdAt(org.getCreatedAt())
                .updatedAt(org.getUpdatedAt())
                .routesCount(routesCount)
                .build();
    }
}


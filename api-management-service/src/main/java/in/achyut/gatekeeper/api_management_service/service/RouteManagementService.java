package in.achyut.gatekeeper.api_management_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.achyut.gatekeeper.api_management_service.dto.requestDto.CreateRouteRequest;
import in.achyut.gatekeeper.api_management_service.dto.requestDto.RouteHeaderRuleDto;
import in.achyut.gatekeeper.api_management_service.dto.requestDto.UpdateRouteRequest;
import in.achyut.gatekeeper.api_management_service.dto.responseDto.GatewaySyncRouteDto;
import in.achyut.gatekeeper.api_management_service.dto.responseDto.RouteResponse;
import in.achyut.gatekeeper.api_management_service.dto.responseDto.RouteVersionResponse;
import in.achyut.gatekeeper.api_management_service.model.ApiRoute;
import in.achyut.gatekeeper.api_management_service.model.Organization;
import in.achyut.gatekeeper.api_management_service.model.RouteConfigurationVersion;
import in.achyut.gatekeeper.api_management_service.model.RouteHeaderRule;
import in.achyut.gatekeeper.api_management_service.repository.ApiRouteRepository;
import in.achyut.gatekeeper.api_management_service.repository.OrganizationRepository;
import in.achyut.gatekeeper.api_management_service.repository.RouteConfigurationVersionRepository;
import in.achyut.gatekeeper.api_management_service.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RouteManagementService {

    private final ApiRouteRepository routeRepository;
    private final OrganizationRepository organizationRepository;
    private final RouteConfigurationVersionRepository versionRepository;
    private final AuditService auditService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<RouteResponse> getRoutes(UserPrincipal principal, String search) {
        Long orgId = isPlatformAdmin(principal) ? null : principal.getOrganizationId();
        List<ApiRoute> routes = routeRepository.searchRoutes(orgId, (search != null && !search.isBlank()) ? search.trim() : null);
        return routes.stream().map(this::toRouteResponse).collect(Collectors.toList());
    }

    public RouteResponse getRouteById(Long id, UserPrincipal principal) {
        ApiRoute route = routeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Route not found with ID: " + id));
        validateAccess(route, principal);
        return toRouteResponse(route);
    }

    public RouteResponse getRouteByRouteId(String routeId, UserPrincipal principal) {
        ApiRoute route = routeRepository.findByRouteId(routeId)
                .orElseThrow(() -> new IllegalArgumentException("Route not found with routeId: " + routeId));
        validateAccess(route, principal);
        return toRouteResponse(route);
    }

    @Transactional
    public RouteResponse createRoute(CreateRouteRequest request, UserPrincipal principal) {
        long startTime = System.currentTimeMillis();

        Organization org = resolveOrganization(request.getOrganizationId(), principal);

        String rawRouteId = request.getRouteId();
        if (rawRouteId == null || rawRouteId.isBlank()) {
            rawRouteId = request.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-");
            if (rawRouteId.startsWith("-")) rawRouteId = rawRouteId.substring(1);
            if (rawRouteId.endsWith("-")) rawRouteId = rawRouteId.substring(0, rawRouteId.length() - 1);
            if (rawRouteId.isBlank()) rawRouteId = "route-" + UUID.randomUUID().toString().substring(0, 8);
        }
        String finalRouteId = rawRouteId.trim();

        if (routeRepository.existsByOrganizationIdAndRouteId(org.getId(), finalRouteId)) {
            if (request.getRouteId() == null || request.getRouteId().isBlank()) {
                finalRouteId = finalRouteId + "-" + UUID.randomUUID().toString().substring(0, 6);
            } else {
                throw new IllegalArgumentException("Route ID '" + finalRouteId + "' already exists in organization " + org.getName());
            }
        }

        Set<String> methods = request.getAllowedMethods() != null && !request.getAllowedMethods().isEmpty()
                ? request.getAllowedMethods().stream().map(String::toUpperCase).collect(Collectors.toSet())
                : new HashSet<>(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));

        ApiRoute route = ApiRoute.builder()
                .organization(org)
                .routeId(finalRouteId)
                .name(request.getName().trim())
                .pathPattern(request.getPathPattern().trim())
                .targetBaseUrl(request.getTargetBaseUrl().trim())
                .targetPathPrefix(request.getTargetPathPrefix() != null ? request.getTargetPathPrefix().trim() : "")
                .requestsPerMinute(request.getRequestsPerMinute() != null ? request.getRequestsPerMinute() : 120)
                .responseTimeoutMs(request.getResponseTimeoutMs() != null ? request.getResponseTimeoutMs() : 5000)
                .idempotencyEnabled(Boolean.TRUE.equals(request.getIdempotencyEnabled()))
                .active(request.getActive() != null ? request.getActive() : true)
                .configurationVersion(1L)
                .allowedMethods(methods)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        if (request.getHeaderRules() != null) {
            for (RouteHeaderRuleDto ruleDto : request.getHeaderRules()) {
                RouteHeaderRule rule = RouteHeaderRule.builder()
                        .route(route)
                        .direction(ruleDto.getDirection() != null ? ruleDto.getDirection().toUpperCase() : "REQUEST")
                        .action(ruleDto.getAction() != null ? ruleDto.getAction().toUpperCase() : "ADD")
                        .headerName(ruleDto.getHeaderName())
                        .headerValue(ruleDto.getHeaderValue())
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
                route.getHeaderRules().add(rule);
            }
        }

        ApiRoute saved = routeRepository.save(route);
        saveVersionSnapshot(saved, "CREATED");

        auditService.record(principal.getUsername(), "CREATE_ROUTE", "ROUTE", saved.getRouteId(),
                "SUCCESS", "Created route " + saved.getName() + " [" + saved.getPathPattern() + "]",
                org, System.currentTimeMillis() - startTime);

        return toRouteResponse(saved);
    }

    @Transactional
    public RouteResponse updateRoute(Long id, UpdateRouteRequest request, UserPrincipal principal) {
        long startTime = System.currentTimeMillis();

        ApiRoute route = routeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Route not found with ID: " + id));
        validateAccess(route, principal);

        if (request.getName() != null && !request.getName().isBlank()) {
            route.setName(request.getName().trim());
        }
        if (request.getPathPattern() != null && !request.getPathPattern().isBlank()) {
            route.setPathPattern(request.getPathPattern().trim());
        }
        if (request.getTargetBaseUrl() != null && !request.getTargetBaseUrl().isBlank()) {
            route.setTargetBaseUrl(request.getTargetBaseUrl().trim());
        }
        if (request.getTargetPathPrefix() != null) {
            route.setTargetPathPrefix(request.getTargetPathPrefix().trim());
        }
        if (request.getRequestsPerMinute() != null) {
            route.setRequestsPerMinute(request.getRequestsPerMinute());
        }
        if (request.getResponseTimeoutMs() != null) {
            route.setResponseTimeoutMs(request.getResponseTimeoutMs());
        }
        if (request.getIdempotencyEnabled() != null) {
            route.setIdempotencyEnabled(request.getIdempotencyEnabled());
        }
        if (request.getActive() != null) {
            route.setActive(request.getActive());
        }
        if (request.getAllowedMethods() != null) {
            route.setAllowedMethods(request.getAllowedMethods().stream().map(String::toUpperCase).collect(Collectors.toSet()));
        }

        if (request.getHeaderRules() != null) {
            route.getHeaderRules().clear();
            for (RouteHeaderRuleDto ruleDto : request.getHeaderRules()) {
                RouteHeaderRule rule = RouteHeaderRule.builder()
                        .route(route)
                        .direction(ruleDto.getDirection() != null ? ruleDto.getDirection().toUpperCase() : "REQUEST")
                        .action(ruleDto.getAction() != null ? ruleDto.getAction().toUpperCase() : "ADD")
                        .headerName(ruleDto.getHeaderName())
                        .headerValue(ruleDto.getHeaderValue())
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
                route.getHeaderRules().add(rule);
            }
        }

        route.setConfigurationVersion(route.getConfigurationVersion() + 1);
        route.setUpdatedAt(LocalDateTime.now());

        ApiRoute saved = routeRepository.save(route);
        saveVersionSnapshot(saved, "UPDATED");

        auditService.record(principal.getUsername(), "UPDATE_ROUTE", "ROUTE", saved.getRouteId(),
                "SUCCESS", "Updated route " + saved.getName() + " to version " + saved.getConfigurationVersion(),
                saved.getOrganization(), System.currentTimeMillis() - startTime);

        return toRouteResponse(saved);
    }

    @Transactional
    public RouteResponse toggleRouteActive(Long id, UserPrincipal principal) {
        long startTime = System.currentTimeMillis();

        ApiRoute route = routeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Route not found with ID: " + id));
        validateAccess(route, principal);

        boolean newActive = !Boolean.TRUE.equals(route.getActive());
        route.setActive(newActive);
        route.setConfigurationVersion(route.getConfigurationVersion() + 1);
        route.setUpdatedAt(LocalDateTime.now());

        ApiRoute saved = routeRepository.save(route);
        String changeType = newActive ? "ACTIVATED" : "DEACTIVATED";
        saveVersionSnapshot(saved, changeType);

        auditService.record(principal.getUsername(), changeType + "_ROUTE", "ROUTE", saved.getRouteId(),
                "SUCCESS", (newActive ? "Activated" : "Deactivated") + " route " + saved.getName(),
                saved.getOrganization(), System.currentTimeMillis() - startTime);

        return toRouteResponse(saved);
    }

    @Transactional
    public void deleteRoute(Long id, UserPrincipal principal) {
        long startTime = System.currentTimeMillis();

        ApiRoute route = routeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Route not found with ID: " + id));
        validateAccess(route, principal);

        saveVersionSnapshot(route, "DELETED");
        routeRepository.delete(route);

        auditService.record(principal.getUsername(), "DELETE_ROUTE", "ROUTE", route.getRouteId(),
                "SUCCESS", "Deleted route " + route.getName(),
                route.getOrganization(), System.currentTimeMillis() - startTime);
    }

    public List<RouteVersionResponse> getRouteVersions(String routeId, UserPrincipal principal) {
        ApiRoute route = routeRepository.findByRouteId(routeId)
                .orElseThrow(() -> new IllegalArgumentException("Route not found with routeId: " + routeId));
        validateAccess(route, principal);

        List<RouteConfigurationVersion> versions = versionRepository.findByOrganizationIdAndRouteIdOrderByVersionNumberDesc(
                route.getOrganization().getId(), routeId
        );

        return versions.stream().map(v -> RouteVersionResponse.builder()
                .id(v.getId())
                .organizationId(v.getOrganization().getId())
                .routeId(v.getRouteId())
                .versionNumber(v.getVersionNumber())
                .changeType(v.getChangeType())
                .configurationSnapshot(v.getConfigurationSnapshot())
                .createdAt(v.getCreatedAt())
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public RouteResponse rollbackRoute(String routeId, Long targetVersion, UserPrincipal principal) {
        long startTime = System.currentTimeMillis();

        ApiRoute route = routeRepository.findByRouteId(routeId)
                .orElseThrow(() -> new IllegalArgumentException("Route not found with routeId: " + routeId));
        validateAccess(route, principal);

        RouteConfigurationVersion snapshot = versionRepository.findByOrganizationIdAndRouteIdAndVersionNumber(
                route.getOrganization().getId(), routeId, targetVersion
        ).orElseThrow(() -> new IllegalArgumentException("Target version " + targetVersion + " not found for route: " + routeId));

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> map = objectMapper.readValue(snapshot.getConfigurationSnapshot(), Map.class);

            if (map.containsKey("name")) route.setName((String) map.get("name"));
            if (map.containsKey("pathPattern")) route.setPathPattern((String) map.get("pathPattern"));
            if (map.containsKey("targetBaseUrl")) route.setTargetBaseUrl((String) map.get("targetBaseUrl"));
            if (map.containsKey("targetPathPrefix")) route.setTargetPathPrefix((String) map.get("targetPathPrefix"));
            if (map.containsKey("requestsPerMinute")) route.setRequestsPerMinute((Integer) map.get("requestsPerMinute"));
            if (map.containsKey("responseTimeoutMs")) route.setResponseTimeoutMs((Integer) map.get("responseTimeoutMs"));
            if (map.containsKey("idempotencyEnabled")) route.setIdempotencyEnabled((Boolean) map.get("idempotencyEnabled"));
            if (map.containsKey("active")) route.setActive((Boolean) map.get("active"));

            route.setConfigurationVersion(route.getConfigurationVersion() + 1);
            route.setUpdatedAt(LocalDateTime.now());

            ApiRoute saved = routeRepository.save(route);
            saveVersionSnapshot(saved, "ROLLBACK_TO_V" + targetVersion);

            auditService.record(principal.getUsername(), "ROLLBACK_ROUTE", "ROUTE", saved.getRouteId(),
                    "SUCCESS", "Rolled back route " + saved.getName() + " to version " + targetVersion,
                    saved.getOrganization(), System.currentTimeMillis() - startTime);

            return toRouteResponse(saved);
        } catch (Exception e) {
            log.error("Failed to rollback route: {}", e.getMessage(), e);
            throw new RuntimeException("Rollback failed: " + e.getMessage(), e);
        }
    }

    public List<GatewaySyncRouteDto> getActiveRoutesForGatewaySync() {
        List<ApiRoute> activeRoutes = routeRepository.findAllActiveRoutes();
        return activeRoutes.stream().map(route -> GatewaySyncRouteDto.builder()
                .id(route.getId())
                .organizationId(route.getOrganization().getId())
                .routeId(route.getRouteId())
                .name(route.getName())
                .pathPattern(route.getPathPattern())
                .targetBaseUrl(route.getTargetBaseUrl())
                .targetPathPrefix(route.getTargetPathPrefix())
                .requestsPerMinute(route.getRequestsPerMinute())
                .responseTimeoutMs(route.getResponseTimeoutMs())
                .idempotencyEnabled(route.getIdempotencyEnabled())
                .active(route.getActive())
                .configurationVersion(route.getConfigurationVersion())
                .allowedMethods(route.getAllowedMethods())
                .headerRules(route.getHeaderRules().stream().map(this::toHeaderRuleDto).collect(Collectors.toList()))
                .build()
        ).collect(Collectors.toList());
    }

    private void saveVersionSnapshot(ApiRoute route, String changeType) {
        try {
            Map<String, Object> snapshot = new HashMap<>();
            snapshot.put("routeId", route.getRouteId());
            snapshot.put("name", route.getName());
            snapshot.put("pathPattern", route.getPathPattern());
            snapshot.put("targetBaseUrl", route.getTargetBaseUrl());
            snapshot.put("targetPathPrefix", route.getTargetPathPrefix());
            snapshot.put("requestsPerMinute", route.getRequestsPerMinute());
            snapshot.put("responseTimeoutMs", route.getResponseTimeoutMs());
            snapshot.put("idempotencyEnabled", route.getIdempotencyEnabled());
            snapshot.put("active", route.getActive());
            snapshot.put("configurationVersion", route.getConfigurationVersion());
            snapshot.put("allowedMethods", route.getAllowedMethods());
            snapshot.put("headerRules", route.getHeaderRules().stream().map(this::toHeaderRuleDto).collect(Collectors.toList()));

            String snapshotJson = objectMapper.writeValueAsString(snapshot);

            RouteConfigurationVersion version = RouteConfigurationVersion.builder()
                    .organization(route.getOrganization())
                    .routeId(route.getRouteId())
                    .versionNumber(route.getConfigurationVersion())
                    .changeType(changeType)
                    .configurationSnapshot(snapshotJson)
                    .createdAt(LocalDateTime.now())
                    .build();

            versionRepository.save(version);
        } catch (Exception e) {
            log.warn("Failed to create version snapshot for route {}: {}", route.getRouteId(), e.getMessage());
        }
    }

    private Organization resolveOrganization(Long requestedOrgId, UserPrincipal principal) {
        if (!isPlatformAdmin(principal) && principal.getOrganizationId() != null) {
            return organizationRepository.findById(principal.getOrganizationId())
                    .orElseThrow(() -> new IllegalArgumentException("User organization not found"));
        }

        if (requestedOrgId != null) {
            return organizationRepository.findById(requestedOrgId)
                    .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + requestedOrgId));
        }

        // Return first or create default
        return organizationRepository.findAll().stream().findFirst().orElseGet(() -> {
            Organization defaultOrg = Organization.builder()
                    .name("Default Organization")
                    .slug("default-org")
                    .status("ACTIVE")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            return organizationRepository.save(defaultOrg);
        });
    }

    private boolean isPlatformAdmin(UserPrincipal principal) {
        return principal != null && ("PLATFORM_ADMIN".equalsIgnoreCase(principal.getRoleName())
                || principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PLATFORM_ADMIN")));
    }

    private void validateAccess(ApiRoute route, UserPrincipal principal) {
        if (isPlatformAdmin(principal)) {
            return;
        }
        if (principal.getOrganizationId() == null || !principal.getOrganizationId().equals(route.getOrganization().getId())) {
            throw new SecurityException("Unauthorized access to route in organization " + route.getOrganization().getId());
        }
    }

    private RouteResponse toRouteResponse(ApiRoute route) {
        return RouteResponse.builder()
                .id(route.getId())
                .routeId(route.getRouteId())
                .organizationId(route.getOrganization().getId())
                .organizationName(route.getOrganization().getName())
                .name(route.getName())
                .pathPattern(route.getPathPattern())
                .targetBaseUrl(route.getTargetBaseUrl())
                .targetPathPrefix(route.getTargetPathPrefix())
                .requestsPerMinute(route.getRequestsPerMinute())
                .responseTimeoutMs(route.getResponseTimeoutMs())
                .idempotencyEnabled(route.getIdempotencyEnabled())
                .active(route.getActive())
                .configurationVersion(route.getConfigurationVersion())
                .createdAt(route.getCreatedAt())
                .updatedAt(route.getUpdatedAt())
                .allowedMethods(route.getAllowedMethods())
                .headerRules(route.getHeaderRules().stream().map(this::toHeaderRuleDto).collect(Collectors.toList()))
                .build();
    }

    private RouteHeaderRuleDto toHeaderRuleDto(RouteHeaderRule rule) {
        return RouteHeaderRuleDto.builder()
                .id(rule.getId())
                .direction(rule.getDirection())
                .action(rule.getAction())
                .headerName(rule.getHeaderName())
                .headerValue(rule.getHeaderValue())
                .build();
    }
}


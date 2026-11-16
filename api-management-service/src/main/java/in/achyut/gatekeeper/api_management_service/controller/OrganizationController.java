package in.achyut.gatekeeper.api_management_service.controller;

import in.achyut.gatekeeper.api_management_service.dto.requestDto.CreateOrganizationRequest;
import in.achyut.gatekeeper.api_management_service.dto.requestDto.UpdateOrganizationRequest;
import in.achyut.gatekeeper.api_management_service.dto.responseDto.ApiResponse;
import in.achyut.gatekeeper.api_management_service.dto.responseDto.OrganizationResponse;
import in.achyut.gatekeeper.api_management_service.security.UserPrincipal;
import in.achyut.gatekeeper.api_management_service.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrganizationResponse>>> getAllOrganizations() {
        return ResponseEntity.ok(ApiResponse.ok(organizationService.getAllOrganizations()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrganizationResponse>> getOrganizationById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(organizationService.getOrganizationById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<ApiResponse<OrganizationResponse>> createOrganization(
            @Valid @RequestBody CreateOrganizationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        String actor = principal != null ? principal.getUsername() : "system";
        OrganizationResponse response = organizationService.createOrganization(request, actor);
        return ResponseEntity.ok(ApiResponse.ok("Organization created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<ApiResponse<OrganizationResponse>> updateOrganization(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrganizationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        String actor = principal != null ? principal.getUsername() : "system";
        OrganizationResponse response = organizationService.updateOrganization(id, request, actor);
        return ResponseEntity.ok(ApiResponse.ok("Organization updated successfully", response));
    }
}


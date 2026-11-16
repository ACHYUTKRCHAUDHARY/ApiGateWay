package in.achyut.gatekeeper.api_management_service.controller;

import in.achyut.gatekeeper.api_management_service.dto.requestDto.CreateRouteRequest;
import in.achyut.gatekeeper.api_management_service.dto.requestDto.RollbackRouteRequest;
import in.achyut.gatekeeper.api_management_service.dto.requestDto.UpdateRouteRequest;
import in.achyut.gatekeeper.api_management_service.dto.responseDto.ApiResponse;
import in.achyut.gatekeeper.api_management_service.dto.responseDto.RouteResponse;
import in.achyut.gatekeeper.api_management_service.dto.responseDto.RouteVersionResponse;
import in.achyut.gatekeeper.api_management_service.security.UserPrincipal;
import in.achyut.gatekeeper.api_management_service.service.RouteManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/routes")
@RequiredArgsConstructor
public class RouteController {

    private final RouteManagementService routeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RouteResponse>>> getRoutes(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.ok(routeService.getRoutes(principal, search)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RouteResponse>> getRouteById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(routeService.getRouteById(id, principal)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RouteResponse>> createRoute(
            @Valid @RequestBody CreateRouteRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        RouteResponse response = routeService.createRoute(request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Route created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RouteResponse>> updateRoute(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRouteRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        RouteResponse response = routeService.updateRoute(id, request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Route updated successfully", response));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<RouteResponse>> toggleRouteActive(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        RouteResponse response = routeService.toggleRouteActive(id, principal);
        return ResponseEntity.ok(ApiResponse.ok("Route status changed", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoute(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        routeService.deleteRoute(id, principal);
        return ResponseEntity.ok(ApiResponse.ok("Route deleted successfully", null));
    }

    @GetMapping("/{routeId}/versions")
    public ResponseEntity<ApiResponse<List<RouteVersionResponse>>> getRouteVersions(
            @PathVariable String routeId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(routeService.getRouteVersions(routeId, principal)));
    }

    @PostMapping("/{routeId}/rollback")
    public ResponseEntity<ApiResponse<RouteResponse>> rollbackRoute(
            @PathVariable String routeId,
            @Valid @RequestBody RollbackRouteRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        RouteResponse response = routeService.rollbackRoute(routeId, request.getTargetVersion(), principal);
        return ResponseEntity.ok(ApiResponse.ok("Route rolled back to version " + request.getTargetVersion(), response));
    }
}


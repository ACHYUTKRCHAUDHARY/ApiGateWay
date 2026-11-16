package in.achyut.gatekeeper.api_management_service.controller;

import in.achyut.gatekeeper.api_management_service.dto.requestDto.LoginRequest;
import in.achyut.gatekeeper.api_management_service.dto.requestDto.RegisterUserRequest;
import in.achyut.gatekeeper.api_management_service.dto.responseDto.ApiResponse;
import in.achyut.gatekeeper.api_management_service.dto.responseDto.AuthResponse;
import in.achyut.gatekeeper.api_management_service.dto.responseDto.UserProfileResponse;
import in.achyut.gatekeeper.api_management_service.security.UserPrincipal;
import in.achyut.gatekeeper.api_management_service.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileResponse>> register(
            @Valid @RequestBody RegisterUserRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        String actor = principal != null ? principal.getUsername() : "anonymous";
        UserProfileResponse response = authService.register(request, actor);
        return ResponseEntity.ok(ApiResponse.ok("User registered successfully", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal) {
        UserProfileResponse response = authService.getProfile(principal);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}


package in.achyut.gatekeeper.api_management_service.config;

import in.achyut.gatekeeper.api_management_service.model.*;
import in.achyut.gatekeeper.api_management_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final OrganizationRepository organizationRepository;
    private final RoleRepository roleRepository;
    private final ManagementUserRepository userRepository;
    private final ApiRouteRepository routeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking baseline data initialization...");

        // Ensure roles exist
        Role platformAdminRole = roleRepository.findByName("PLATFORM_ADMIN").orElseGet(() ->
                roleRepository.save(Role.builder().name("PLATFORM_ADMIN").build()));
        Role tenantAdminRole = roleRepository.findByName("TENANT_ADMIN").orElseGet(() ->
                roleRepository.save(Role.builder().name("TENANT_ADMIN").build()));
        Role gatewayServiceRole = roleRepository.findByName("GATEWAY_SERVICE").orElseGet(() ->
                roleRepository.save(Role.builder().name("GATEWAY_SERVICE").build()));

        // Ensure default organization exists
        Organization defaultOrg = organizationRepository.findBySlug("gatekeeper-core").orElseGet(() ->
                organizationRepository.save(Organization.builder()
                        .name("Gatekeeper Core Systems")
                        .slug("gatekeeper-core")
                        .status("ACTIVE")
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build())
        );

        // Ensure platform-admin user exists and password is valid (admin123)
        userRepository.findByUsername("platform-admin").ifPresentOrElse(user -> {
            if (!passwordEncoder.matches("admin123", user.getPasswordHash())) {
                user.setPasswordHash(passwordEncoder.encode("admin123"));
                userRepository.save(user);
                log.info("Reset platform-admin password to admin123");
            }
        }, () -> {
            ManagementUser admin = ManagementUser.builder()
                    .username("platform-admin")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(platformAdminRole)
                    .organization(null)
                    .enabled(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            userRepository.save(admin);
            log.info("Created platform-admin user (admin123)");
        });

        // Ensure tenant-admin user exists
        userRepository.findByUsername("tenant-admin").orElseGet(() -> {
            ManagementUser tenantAdmin = ManagementUser.builder()
                    .username("tenant-admin")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(tenantAdminRole)
                    .organization(defaultOrg)
                    .enabled(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            log.info("Created tenant-admin user (admin123)");
            return userRepository.save(tenantAdmin);
        });

        // Ensure gateway-service user exists
        userRepository.findByUsername("gateway-service").orElseGet(() -> {
            ManagementUser gatewayService = ManagementUser.builder()
                    .username("gateway-service")
                    .passwordHash(passwordEncoder.encode("gateway123"))
                    .role(gatewayServiceRole)
                    .organization(null)
                    .enabled(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            log.info("Created gateway-service user");
            return userRepository.save(gatewayService);
        });

        // Seed demo routes if none exist
        if (routeRepository.count() == 0) {
            log.info("Seeding demo routes...");

            // Route 1: Mock Users Route
            ApiRoute usersRoute = ApiRoute.builder()
                    .organization(defaultOrg)
                    .routeId("users-service-route")
                    .name("User Management Service")
                    .pathPattern("/api/v1/users/**")
                    .targetBaseUrl("http://localhost:8081")
                    .targetPathPrefix("/api/v1/mock/users")
                    .requestsPerMinute(60)
                    .responseTimeoutMs(4000)
                    .idempotencyEnabled(true)
                    .active(true)
                    .configurationVersion(1L)
                    .allowedMethods(new HashSet<>(Set.of("GET", "POST", "PUT", "DELETE")))
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            usersRoute.getHeaderRules().add(RouteHeaderRule.builder()
                    .route(usersRoute)
                    .direction("REQUEST")
                    .action("ADD")
                    .headerName("X-Forwarded-By-Gatekeeper")
                    .headerValue("smart-gateway-service")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build());

            usersRoute.getHeaderRules().add(RouteHeaderRule.builder()
                    .route(usersRoute)
                    .direction("RESPONSE")
                    .action("ADD")
                    .headerName("X-Gatekeeper-Powered")
                    .headerValue("True")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build());

            routeRepository.save(usersRoute);

            // Route 2: Echo Service Route
            ApiRoute echoRoute = ApiRoute.builder()
                    .organization(defaultOrg)
                    .routeId("echo-service-route")
                    .name("Echo Debugging Service")
                    .pathPattern("/echo/**")
                    .targetBaseUrl("http://localhost:8081")
                    .targetPathPrefix("/api/v1/mock/echo")
                    .requestsPerMinute(120)
                    .responseTimeoutMs(3000)
                    .idempotencyEnabled(false)
                    .active(true)
                    .configurationVersion(1L)
                    .allowedMethods(new HashSet<>(Set.of("GET", "POST", "PUT", "DELETE", "PATCH")))
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            routeRepository.save(echoRoute);

            // Route 3: Public Delay / Timeout test Route
            ApiRoute delayRoute = ApiRoute.builder()
                    .organization(defaultOrg)
                    .routeId("delay-test-route")
                    .name("Latency & Timeout Test Service")
                    .pathPattern("/delay/**")
                    .targetBaseUrl("http://localhost:8081")
                    .targetPathPrefix("/api/v1/mock/delay")
                    .requestsPerMinute(30)
                    .responseTimeoutMs(2000)
                    .idempotencyEnabled(false)
                    .active(true)
                    .configurationVersion(1L)
                    .allowedMethods(new HashSet<>(Set.of("GET")))
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            routeRepository.save(delayRoute);

            log.info("Initialized 3 demo routes.");
        }
    }
}


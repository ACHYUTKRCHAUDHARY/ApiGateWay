package in.achyut.gatekeeper.api_management_service.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "api_routes", uniqueConstraints = {
        @UniqueConstraint(name = "uk_api_routes_tenant_route", columnNames = {"organization_id", "route_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "route_id", nullable = false, length = 100)
    private String routeId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "path_pattern", nullable = false, length = 500)
    private String pathPattern;

    @Column(name = "target_base_url", nullable = false, length = 1000)
    private String targetBaseUrl;

    @Column(name = "target_path_prefix", nullable = false, length = 500)
    private String targetPathPrefix;

    @Column(name = "requests_per_minute")
    private Integer requestsPerMinute;

    @Column(name = "response_timeout_ms", nullable = false)
    private Integer responseTimeoutMs;

    @Column(name = "idempotency_enabled", nullable = false)
    private Boolean idempotencyEnabled;

    @Column(nullable = false)
    private Boolean active;

    @Column(name = "configuration_version", nullable = false)
    private Long configurationVersion;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "route_allowed_methods", joinColumns = @JoinColumn(name = "route_pk"))
    @Column(name = "http_method", nullable = false, length = 10)
    @Builder.Default
    private Set<String> allowedMethods = new HashSet<>();

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    @Builder.Default
    private List<RouteHeaderRule> headerRules = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (configurationVersion == null) {
            configurationVersion = 1L;
        }
        if (active == null) {
            active = false;
        }
        if (idempotencyEnabled == null) {
            idempotencyEnabled = false;
        }
        if (responseTimeoutMs == null) {
            responseTimeoutMs = 5000;
        }
        if (targetPathPrefix == null) {
            targetPathPrefix = "";
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}


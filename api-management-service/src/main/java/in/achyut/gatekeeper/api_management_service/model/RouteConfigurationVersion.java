package in.achyut.gatekeeper.api_management_service.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "route_configuration_versions", uniqueConstraints = {
        @UniqueConstraint(name = "uk_route_versions_tenant_version", columnNames = {"organization_id", "route_id", "version_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteConfigurationVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "route_id", nullable = false, length = 100)
    private String routeId;

    @Column(name = "version_number", nullable = false)
    private Long versionNumber;

    @Column(name = "change_type", nullable = false, length = 30)
    private String changeType;

    @Lob
    @Column(name = "configuration_snapshot", nullable = false, columnDefinition = "LONGTEXT")
    private String configurationSnapshot;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}


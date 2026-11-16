package in.achyut.gatekeeper.api_management_service.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "route_header_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteHeaderRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_pk", nullable = false)
    @JsonBackReference
    private ApiRoute route;

    @Column(nullable = false, length = 20)
    private String direction; // REQUEST, RESPONSE

    @Column(nullable = false, length = 20)
    private String action; // ADD, REMOVE, SET

    @Column(name = "header_name", nullable = false, length = 200)
    private String headerName;

    @Column(name = "header_value", length = 2000)
    private String headerValue;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}


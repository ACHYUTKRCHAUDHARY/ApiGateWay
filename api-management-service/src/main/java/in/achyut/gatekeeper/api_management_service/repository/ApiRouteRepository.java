package in.achyut.gatekeeper.api_management_service.repository;

import in.achyut.gatekeeper.api_management_service.model.ApiRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApiRouteRepository extends JpaRepository<ApiRoute, Long> {

    Optional<ApiRoute> findByOrganizationIdAndRouteId(Long organizationId, String routeId);

    Optional<ApiRoute> findByRouteId(String routeId);

    List<ApiRoute> findByOrganizationId(Long organizationId);

    List<ApiRoute> findByActiveTrue();

    boolean existsByOrganizationIdAndRouteId(Long organizationId, String routeId);

    @Query("SELECT r FROM ApiRoute r WHERE r.active = true")
    List<ApiRoute> findAllActiveRoutes();

    @Query("SELECT r FROM ApiRoute r WHERE (:orgId IS NULL OR r.organization.id = :orgId) AND (:search IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.routeId) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.pathPattern) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<ApiRoute> searchRoutes(@Param("orgId") Long orgId, @Param("search") String search);
}


package in.achyut.gatekeeper.api_management_service.repository;

import in.achyut.gatekeeper.api_management_service.model.RouteConfigurationVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RouteConfigurationVersionRepository extends JpaRepository<RouteConfigurationVersion, Long> {

    List<RouteConfigurationVersion> findByOrganizationIdAndRouteIdOrderByVersionNumberDesc(Long organizationId, String routeId);

    List<RouteConfigurationVersion> findByRouteIdOrderByVersionNumberDesc(String routeId);

    Optional<RouteConfigurationVersion> findByOrganizationIdAndRouteIdAndVersionNumber(Long organizationId, String routeId, Long versionNumber);

    Optional<RouteConfigurationVersion> findTopByOrganizationIdAndRouteIdOrderByVersionNumberDesc(Long organizationId, String routeId);
}


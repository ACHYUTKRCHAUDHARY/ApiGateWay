package in.achyut.gatekeeper.api_management_service.repository;

import in.achyut.gatekeeper.api_management_service.model.RouteHeaderRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteHeaderRuleRepository extends JpaRepository<RouteHeaderRule, Long> {
    List<RouteHeaderRule> findByRouteId(Long routePk);
}


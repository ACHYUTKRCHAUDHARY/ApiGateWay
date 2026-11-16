package in.achyut.gatekeeper.api_management_service.repository;

import in.achyut.gatekeeper.api_management_service.model.ManagementUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ManagementUserRepository extends JpaRepository<ManagementUser, Long> {
    Optional<ManagementUser> findByUsername(String username);
    boolean existsByUsername(String username);
    List<ManagementUser> findByOrganizationId(Long organizationId);
}


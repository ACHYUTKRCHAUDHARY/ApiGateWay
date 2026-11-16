package in.achyut.gatekeeper.api_management_service.security;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
@Slf4j
public class JwtTokenProvider {

    private final byte[] secretKeyBytes;
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${gatekeeper.jwt.secret:gatekeeper-super-secret-jwt-signing-key-for-smart-gateway-api-security-32bytes}") String secret,
            @Value("${gatekeeper.jwt.expiration-ms:86400000}") long expirationMs) {
        this.secretKeyBytes = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationMs = expirationMs;
    }

    public String generateToken(String username, String role, Long organizationId) {
        try {
            JWSSigner signer = new MACSigner(secretKeyBytes);

            Date now = new Date();
            Date expiryDate = new Date(now.getTime() + expirationMs);

            JWTClaimsSet.Builder builder = new JWTClaimsSet.Builder()
                    .subject(username)
                    .issueTime(now)
                    .expirationTime(expiryDate)
                    .claim("role", role);

            if (organizationId != null) {
                builder.claim("organizationId", organizationId);
            }

            SignedJWT signedJWT = new SignedJWT(
                    new JWSHeader(JWSAlgorithm.HS256),
                    builder.build()
            );

            signedJWT.sign(signer);
            return signedJWT.serialize();
        } catch (Exception e) {
            log.error("Failed to generate JWT token", e);
            throw new RuntimeException("Error generating JWT", e);
        }
    }

    public boolean validateToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(secretKeyBytes);

            if (!signedJWT.verify(verifier)) {
                return false;
            }

            Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            return expirationTime != null && expirationTime.after(new Date());
        } catch (Exception e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return signedJWT.getJWTClaimsSet().getSubject();
        } catch (Exception e) {
            log.error("Failed to extract username from token", e);
            return null;
        }
    }

    public String getRoleFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            Object role = signedJWT.getJWTClaimsSet().getClaim("role");
            return role != null ? role.toString() : null;
        } catch (Exception e) {
            return null;
        }
    }

    public Long getOrganizationIdFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            Object orgId = signedJWT.getJWTClaimsSet().getClaim("organizationId");
            return orgId != null ? Long.valueOf(orgId.toString()) : null;
        } catch (Exception e) {
            return null;
        }
    }
}


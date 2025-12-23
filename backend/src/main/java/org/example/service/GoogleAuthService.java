package org.example.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Service để xác thực Google OAuth token
 */
@Service
@Slf4j
public class GoogleAuthService {

    @Value("${google.client-id:}")
    private String googleClientId;

    @Value("${google.client-secret:}")
    private String googleClientSecret;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Exchange authorization code lấy access token (Authorization Code flow)
     * @param code Authorization code từ Google
     * @param redirectUri Redirect URI đã đăng ký
     * @return Access token hoặc null nếu thất bại
     */
    public String exchangeCodeForToken(String code, String redirectUri) {
        if (googleClientId == null || googleClientId.isEmpty() ||
            googleClientSecret == null || googleClientSecret.isEmpty()) {
            log.error("Google client ID or secret not configured");
            return null;
        }

        try {
            String tokenUrl = "https://oauth2.googleapis.com/token";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("code", code);
            params.add("client_id", googleClientId);
            params.add("client_secret", googleClientSecret);
            params.add("redirect_uri", redirectUri);
            params.add("grant_type", "authorization_code");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, request, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                return jsonNode.has("access_token") ? jsonNode.get("access_token").asText() : null;
            }

            return null;
        } catch (Exception e) {
            log.error("Failed to exchange code for token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Verify Google access token và lấy thông tin user
     * @param accessToken Google access token
     * @return Map chứa thông tin user (email, name, sub/id, picture)
     */
    public Map<String, String> verifyAccessToken(String accessToken) {
        try {
            // Gọi Google API để lấy thông tin user từ access token
            String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                userInfoUrl, HttpMethod.GET, entity, String.class
            );

            if (response.getStatusCode() != HttpStatus.OK) {
                log.error("Google API returned status: {}", response.getStatusCode());
                return null;
            }

            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            
            Map<String, String> userInfo = new HashMap<>();
            userInfo.put("sub", jsonNode.has("sub") ? jsonNode.get("sub").asText() : null);
            userInfo.put("email", jsonNode.has("email") ? jsonNode.get("email").asText() : null);
            userInfo.put("name", jsonNode.has("name") ? jsonNode.get("name").asText() : null);
            userInfo.put("picture", jsonNode.has("picture") ? jsonNode.get("picture").asText() : null);
            userInfo.put("email_verified", jsonNode.has("email_verified") ? jsonNode.get("email_verified").asText() : "false");

            // Validate required fields
            if (userInfo.get("email") == null || userInfo.get("sub") == null) {
                log.error("Invalid Google token: missing email or sub");
                return null;
            }

            log.info("Google token verified for user: {}", userInfo.get("email"));
            return userInfo;

        } catch (Exception e) {
            log.error("Failed to verify Google access token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Verify Google ID token (JWT từ Sign-In with Google)
     * @param idToken Google ID token
     * @return Map chứa thông tin user
     */
    public Map<String, String> verifyIdToken(String idToken) {
        try {
            // Gọi Google tokeninfo endpoint để verify ID token
            String tokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            ResponseEntity<String> response = restTemplate.getForEntity(tokenInfoUrl, String.class);

            if (response.getStatusCode() != HttpStatus.OK) {
                log.error("Google tokeninfo returned status: {}", response.getStatusCode());
                return null;
            }

            JsonNode jsonNode = objectMapper.readTree(response.getBody());

            // Verify audience (client ID) nếu được cấu hình
            if (googleClientId != null && !googleClientId.isEmpty()) {
                String aud = jsonNode.has("aud") ? jsonNode.get("aud").asText() : null;
                if (!googleClientId.equals(aud)) {
                    log.error("Invalid Google token: audience mismatch. Expected: {}, Got: {}", googleClientId, aud);
                    return null;
                }
            }

            Map<String, String> userInfo = new HashMap<>();
            userInfo.put("sub", jsonNode.has("sub") ? jsonNode.get("sub").asText() : null);
            userInfo.put("email", jsonNode.has("email") ? jsonNode.get("email").asText() : null);
            userInfo.put("name", jsonNode.has("name") ? jsonNode.get("name").asText() : null);
            userInfo.put("picture", jsonNode.has("picture") ? jsonNode.get("picture").asText() : null);
            userInfo.put("email_verified", jsonNode.has("email_verified") ? jsonNode.get("email_verified").asText() : "false");

            // Validate required fields
            if (userInfo.get("email") == null || userInfo.get("sub") == null) {
                log.error("Invalid Google ID token: missing email or sub");
                return null;
            }

            log.info("Google ID token verified for user: {}", userInfo.get("email"));
            return userInfo;

        } catch (Exception e) {
            log.error("Failed to verify Google ID token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Verify token (tự động detect loại token)
     * @param token Google token (access token hoặc ID token)
     * @return Map chứa thông tin user
     */
    public Map<String, String> verifyToken(String token) {
        if (token == null || token.isEmpty()) {
            return null;
        }

        // ID token thường có format JWT (3 phần ngăn cách bởi dấu chấm)
        if (token.split("\\.").length == 3) {
            Map<String, String> result = verifyIdToken(token);
            if (result != null) {
                return result;
            }
        }

        // Fallback to access token verification
        return verifyAccessToken(token);
    }
}

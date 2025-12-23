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
 * Service để xác thực GitHub OAuth
 */
@Service
@Slf4j
public class GitHubAuthService {

    @Value("${github.client-id:}")
    private String githubClientId;

    @Value("${github.client-secret:}")
    private String githubClientSecret;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Exchange authorization code lấy access token
     * @param code Authorization code từ GitHub
     * @param redirectUri Redirect URI
     * @return Access token hoặc null
     */
    public String exchangeCodeForToken(String code, String redirectUri) {
        if (githubClientId == null || githubClientId.isEmpty() ||
            githubClientSecret == null || githubClientSecret.isEmpty()) {
            log.error("GitHub client ID or secret not configured");
            return null;
        }

        try {
            String tokenUrl = "https://github.com/login/oauth/access_token";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setAccept(java.util.Collections.singletonList(MediaType.APPLICATION_JSON));

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("client_id", githubClientId);
            params.add("client_secret", githubClientSecret);
            params.add("code", code);
            if (redirectUri != null && !redirectUri.isEmpty()) {
                params.add("redirect_uri", redirectUri);
            }

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, request, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                
                if (jsonNode.has("error")) {
                    log.error("GitHub token exchange error: {}", jsonNode.get("error_description").asText());
                    return null;
                }
                
                return jsonNode.has("access_token") ? jsonNode.get("access_token").asText() : null;
            }

            return null;
        } catch (Exception e) {
            log.error("Failed to exchange GitHub code for token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Lấy thông tin user từ GitHub API
     * @param accessToken GitHub access token
     * @return Map chứa thông tin user
     */
    public Map<String, String> getUserInfo(String accessToken) {
        try {
            String userUrl = "https://api.github.com/user";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.set("Accept", "application/vnd.github.v3+json");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                userUrl, HttpMethod.GET, entity, String.class
            );

            if (response.getStatusCode() != HttpStatus.OK) {
                log.error("GitHub API returned status: {}", response.getStatusCode());
                return null;
            }

            JsonNode jsonNode = objectMapper.readTree(response.getBody());

            Map<String, String> userInfo = new HashMap<>();
            userInfo.put("id", jsonNode.has("id") ? String.valueOf(jsonNode.get("id").asLong()) : null);
            userInfo.put("login", jsonNode.has("login") ? jsonNode.get("login").asText() : null);
            userInfo.put("name", jsonNode.has("name") && !jsonNode.get("name").isNull() 
                ? jsonNode.get("name").asText() 
                : jsonNode.has("login") ? jsonNode.get("login").asText() : null);
            userInfo.put("avatar_url", jsonNode.has("avatar_url") ? jsonNode.get("avatar_url").asText() : null);
            
            // Email có thể null nếu user không public
            String email = jsonNode.has("email") && !jsonNode.get("email").isNull() 
                ? jsonNode.get("email").asText() 
                : null;

            // Nếu email null, lấy từ emails API
            if (email == null) {
                email = getPrimaryEmail(accessToken);
            }
            userInfo.put("email", email);

            log.info("GitHub user info retrieved for: {}", userInfo.get("login"));
            return userInfo;

        } catch (Exception e) {
            log.error("Failed to get GitHub user info: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Lấy primary email từ GitHub emails API
     */
    private String getPrimaryEmail(String accessToken) {
        try {
            String emailsUrl = "https://api.github.com/user/emails";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.set("Accept", "application/vnd.github.v3+json");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                emailsUrl, HttpMethod.GET, entity, String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode emails = objectMapper.readTree(response.getBody());
                
                // Tìm primary email
                for (JsonNode emailNode : emails) {
                    if (emailNode.has("primary") && emailNode.get("primary").asBoolean()) {
                        return emailNode.get("email").asText();
                    }
                }
                
                // Fallback: lấy email đầu tiên
                if (emails.isArray() && emails.size() > 0) {
                    return emails.get(0).get("email").asText();
                }
            }
        } catch (Exception e) {
            log.warn("Failed to get GitHub primary email: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Verify và lấy thông tin user từ code
     * @param code Authorization code
     * @param redirectUri Redirect URI
     * @return Map chứa thông tin user hoặc null
     */
    public Map<String, String> verifyCodeAndGetUserInfo(String code, String redirectUri) {
        // Exchange code for token
        String accessToken = exchangeCodeForToken(code, redirectUri);
        if (accessToken == null) {
            return null;
        }

        // Get user info
        return getUserInfo(accessToken);
    }
}

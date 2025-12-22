package org.example.security;

import org.example.exception.RateLimitExceededException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 60;
    private static final int MAX_AUTH_FAILURES_PER_HOUR = 5;
    private static final long MINUTE_IN_MILLIS = 60 * 1000;
    private static final long HOUR_IN_MILLIS = 60 * 60 * 1000;

    private final ConcurrentHashMap<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, FailureCounter> authFailureCounts = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String clientIp = getClientIpAddress(request);
        String requestPath = request.getRequestURI();
        
        // Check general rate limiting
        if (isRateLimited(clientIp)) {
            response.setStatus(429); // Too Many Requests
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"Quá nhiều yêu cầu. Vui lòng thử lại sau.\"}");
            return;
        }

        // Check authentication failure rate limiting for auth endpoints
        if (requestPath.startsWith("/api/auth/") && isAuthFailureRateLimited(clientIp)) {
            response.setStatus(429); // Too Many Requests
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 1 giờ.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimited(String clientIp) {
        long currentTime = System.currentTimeMillis();
        RequestCounter counter = requestCounts.computeIfAbsent(clientIp, k -> new RequestCounter());
        
        // Reset counter if window has passed
        if (currentTime - counter.windowStart.get() > MINUTE_IN_MILLIS) {
            counter.windowStart.set(currentTime);
            counter.requestCount.set(1);
            return false;
        }
        
        return counter.requestCount.incrementAndGet() > MAX_REQUESTS_PER_MINUTE;
    }

    private boolean isAuthFailureRateLimited(String clientIp) {
        long currentTime = System.currentTimeMillis();
        FailureCounter counter = authFailureCounts.computeIfAbsent(clientIp, k -> new FailureCounter());
        
        // Reset counter if window has passed
        if (currentTime - counter.windowStart.get() > HOUR_IN_MILLIS) {
            counter.windowStart.set(currentTime);
            counter.failureCount.set(0);
            return false;
        }
        
        return counter.failureCount.get() >= MAX_AUTH_FAILURES_PER_HOUR;
    }

    public void recordAuthFailure(String clientIp) {
        long currentTime = System.currentTimeMillis();
        FailureCounter counter = authFailureCounts.computeIfAbsent(clientIp, k -> new FailureCounter());
        
        // Reset counter if window has passed
        if (currentTime - counter.windowStart.get() > HOUR_IN_MILLIS) {
            counter.windowStart.set(currentTime);
            counter.failureCount.set(1);
        } else {
            counter.failureCount.incrementAndGet();
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
        if (xForwardedForHeader == null) {
            return request.getRemoteAddr();
        } else {
            return xForwardedForHeader.split(",")[0];
        }
    }

    private static class RequestCounter {
        private final AtomicLong windowStart = new AtomicLong(System.currentTimeMillis());
        private final AtomicInteger requestCount = new AtomicInteger(0);
    }

    private static class FailureCounter {
        private final AtomicLong windowStart = new AtomicLong(System.currentTimeMillis());
        private final AtomicInteger failureCount = new AtomicInteger(0);
    }
}
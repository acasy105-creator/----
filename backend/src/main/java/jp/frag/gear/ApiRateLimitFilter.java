package jp.frag.gear;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Order(1)
public class ApiRateLimitFilter implements Filter {

    private static final long WINDOW_MS = 60_000L; // 1分間
    private static final int MAX_GENERAL_REQUESTS_PER_MIN = 60;
    private static final int MAX_YOUTUBE_REQUESTS_PER_MIN = 15;

    private static class RateWindow {
        volatile long windowStart;
        final AtomicInteger count = new AtomicInteger(0);

        RateWindow(long now) {
            this.windowStart = now;
        }
    }

    private final Map<String, RateWindow> ipWindows = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("Cache-Control", "no-store");

        String path = req.getRequestURI();
        if (!path.startsWith("/api/") || "OPTIONS".equalsIgnoreCase(req.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String clientIp = extractClientIp(req);
        boolean isYoutubeEndpoint = path.contains("/api/youtube");
        String bucketKey = clientIp + (isYoutubeEndpoint ? ":yt" : ":gen");
        int limit = isYoutubeEndpoint ? MAX_YOUTUBE_REQUESTS_PER_MIN : MAX_GENERAL_REQUESTS_PER_MIN;

        long now = System.currentTimeMillis();
        if (ipWindows.size() > 1000) {
            ipWindows.entrySet().removeIf(e -> (now - e.getValue().windowStart) > WINDOW_MS);
        }

        RateWindow window = ipWindows.computeIfAbsent(bucketKey, k -> new RateWindow(now));
        synchronized (window) {
            if (now - window.windowStart > WINDOW_MS) {
                window.windowStart = now;
                window.count.set(0);
            }
            int current = window.count.incrementAndGet();
            res.setHeader("X-RateLimit-Limit", String.valueOf(limit));
            res.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, limit - current)));

            if (current > limit) {
                res.setStatus(429);
                res.setContentType("application/json;charset=UTF-8");
                res.getWriter().write("{\"error\":\"Too Many Requests\",\"message\":\"アクセスが集中しています。少し時間をおいて再試行してください。\"}");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
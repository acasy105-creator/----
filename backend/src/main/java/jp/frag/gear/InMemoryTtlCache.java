package jp.frag.gear;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

@Component
public class InMemoryTtlCache {

    private static final long DEFAULT_TTL_MS = Duration.ofHours(24).toMillis(); // 24時間保持
    private static final int MAX_CACHE_ENTRIES = 500;

    private static class CacheEntry {
        final Object value;
        final long expiresAt;

        CacheEntry(Object value, long expiresAt) {
            this.value = value;
            this.expiresAt = expiresAt;
        }
    }

    private final Map<String, CacheEntry> store = new ConcurrentHashMap<>();

    public <T> T getOrCompute(String rawKey, Supplier<T> loader) {
        return getOrCompute(rawKey, DEFAULT_TTL_MS, loader);
    }

    @SuppressWarnings("unchecked")
    public <T> T getOrCompute(String rawKey, long ttlMs, Supplier<T> loader) {
        String key = normalizeKey(rawKey);
        long now = System.currentTimeMillis();

        CacheEntry existing = store.get(key);
        if (existing != null && now < existing.expiresAt) {
            return (T) existing.value;
        }

        if (store.size() >= MAX_CACHE_ENTRIES) {
            store.entrySet().removeIf(e -> now >= e.getValue().expiresAt);
        }

        T freshValue = loader.get();
        if (freshValue != null) {
            boolean isEmptyCollection = (freshValue instanceof Collection<?>) && ((Collection<?>) freshValue).isEmpty();
            if (!isEmptyCollection) {
                store.put(key, new CacheEntry(freshValue, now + ttlMs));
            }
        }
        return freshValue;
    }

    private String normalizeKey(String rawKey) {
        if (rawKey == null) return "";
        return rawKey.split("[（(]")[0].trim().toLowerCase();
    }
}
package jp.frag.gear;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
public class LiquipediaService {

    private static final Logger LOGGER = LoggerFactory.getLogger(LiquipediaService.class);
    private static final Duration CACHE_TTL = Duration.ofHours(24);
    private static final Duration MIN_REQUEST_INTERVAL = Duration.ofSeconds(2);
    private static final int MAX_PLAYERS_PER_SYNC = 50;

    private final ObjectMapper objectMapper;
    private final String contactEmail;
    private final HttpClient httpClient;
    private final Map<Game, CacheEntry> cache = new EnumMap<>(Game.class);
    private final List<PlayerProfile> bundledDataset;
    private Instant nextRequestTime = Instant.EPOCH;

    public LiquipediaService(
            ObjectMapper objectMapper,
            @Value("${frag.liquipedia.contact-email:}") String contactEmail) {
        this.objectMapper = objectMapper;
        this.contactEmail = contactEmail;
        this.httpClient = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NORMAL)
                .connectTimeout(Duration.ofSeconds(8))
                .build();
        this.bundledDataset = loadBundledDataset();
    }

    // 起動時に resources/players-dataset.json から大規模データセットを読み込む
    private List<PlayerProfile> loadBundledDataset() {
        try (InputStream is = new ClassPathResource("players-dataset.json").getInputStream()) {
            List<PlayerProfile> loaded = objectMapper.readValue(is, new TypeReference<List<PlayerProfile>>() {});
            LOGGER.info("バンドル済みプロ選手データセットを読み込みました: 計 {} 名", loaded.size());
            return loaded;
        } catch (Exception e) {
            LOGGER.warn("players-dataset.json の読み込みに失敗しました: {}", e.getMessage());
            return List.of();
        }
    }

    public synchronized List<PlayerProfile> getPlayers(Game game) {
        CacheEntry entry = cache.get(game);
        Instant now = Instant.now();

        if (entry != null && Duration.between(entry.fetchedAt, now).compareTo(CACHE_TTL) < 0) {
            return entry.players;
        }

        List<PlayerProfile> basePlayers = getBundledPlayersForGame(game);

        try {
            List<PlayerProfile> apiPlayers = fetchPlayersFromApi(game);
            // APIから取得できたデータとバンドル済みデータを重複なしで統合（マージ）
            List<PlayerProfile> merged = mergePlayers(apiPlayers, basePlayers);
            cache.put(game, new CacheEntry(merged, now));
            return merged;
        } catch (Exception e) {
            LOGGER.warn("Liquipedia API制限または通信失敗 (ゲーム: {}): {}。バンドル済みデータセット({}名)を使用します。",
                    game.title(), e.getMessage(), basePlayers.size());
            cache.put(game, new CacheEntry(basePlayers, now));
            return basePlayers;
        }
    }

    private List<PlayerProfile> mergePlayers(List<PlayerProfile> primary, List<PlayerProfile> secondary) {
        Map<String, PlayerProfile> mergedMap = new LinkedHashMap<>();
        for (PlayerProfile p : primary) {
            if (p != null && p.name() != null) {
                mergedMap.put(p.name().toLowerCase(Locale.ROOT), p);
            }
        }
        for (PlayerProfile p : secondary) {
            if (p != null && p.name() != null) {
                mergedMap.putIfAbsent(p.name().toLowerCase(Locale.ROOT), p);
            }
        }
        return new ArrayList<>(mergedMap.values());
    }

    private List<PlayerProfile> getBundledPlayersForGame(Game game) {
        List<PlayerProfile> filtered = new ArrayList<>();
        for (PlayerProfile p : bundledDataset) {
            if (p.game() != null && p.game().equalsIgnoreCase(game.title())) {
                filtered.add(p);
            }
        }
        return filtered;
    }

    private List<PlayerProfile> fetchPlayersFromApi(Game game) throws Exception {
        Instant now = Instant.now();
        if (now.isBefore(nextRequestTime)) {
            long millisToWait = Duration.between(now, nextRequestTime).toMillis();
            Thread.sleep(millisToWait);
        }
        nextRequestTime = Instant.now().plus(MIN_REQUEST_INTERVAL);

        String url = buildApiUrl(game);
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Accept", "application/json")
                .header("Accept-Encoding", "gzip")
                .header("User-Agent", "FragGearIntelligence/1.0");

        if (contactEmail != null && !contactEmail.isBlank()) {
            requestBuilder.header("From", contactEmail.trim());
        }

        HttpResponse<String> response = httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 429) {
            throw new RuntimeException("Liquipedia API returned HTTP 429.");
        }
        if (response.statusCode() != 200) {
            throw new RuntimeException("Liquipedia API error status: " + response.statusCode());
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode parseNode = root.get("parse");
        if (parseNode == null) {
            return List.of();
        }

        String wikitext = parseNode.path("wikitext").path("*").asText("");
        if (wikitext.isBlank()) {
            return List.of();
        }

        return LiquipediaWikitextParser.    parsePlayers(wikitext, game, MAX_PLAYERS_PER_SYNC);
    }

    private String buildApiUrl(Game game) {
        String query = "{{PLAYERPROFILES|game=" + game.wiki() + "}}";
        String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
        return "https://liquipedia.net/" + game.subdomain() + "/api.php?action=parse&format=json&text=" + encoded + "&prop=wikitext";
    }

    private static class CacheEntry {
        final List<PlayerProfile> players;
        final Instant fetchedAt;

        CacheEntry(List<PlayerProfile> players, Instant fetchedAt) {
            this.players = players;
            this.fetchedAt = fetchedAt;
        }
    }
}
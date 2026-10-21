package jp.frag.gear;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.zip.GZIPInputStream;

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
    private Instant nextRequestTime = Instant.EPOCH;

    public LiquipediaService(
            ObjectMapper objectMapper,
            @Value("${liquipedia.contact-email:}") String contactEmail) {
        this.objectMapper = objectMapper;
        this.contactEmail = contactEmail == null ? "" : contactEmail.trim();
        this.httpClient = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NORMAL)
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public synchronized List<PlayerProfile> getPlayers(Game game) {
        CacheEntry entry = cache.get(game);
        Instant now = Instant.now();

        // キャッシュが有効期限内であればそのまま返す
        if (entry != null && Duration.between(entry.fetchedAt, now).compareTo(CACHE_TTL) < 0) {
            return entry.players;
        }

        // キャッシュがない、または期限切れの場合はAPI取得を試みる
        try {
            List<PlayerProfile> players = fetchPlayersFromApi(game);
            cache.put(game, new CacheEntry(players, now));
            return players;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            LOGGER.warn("Liquipedia APIからのデータ取得が中断されました (ゲーム: {})。", game.title());
            return getStaleOrFallbackPlayers(game, entry, now);
        } catch (Exception e) {
            LOGGER.warn("Liquipedia APIからのデータ取得に失敗しました (ゲーム: {}): {}。内蔵フォールバックデータを使用します。", game.title(), e.getMessage());
            return getStaleOrFallbackPlayers(game, entry, now);
        }
    }

    private List<PlayerProfile> getStaleOrFallbackPlayers(Game game, CacheEntry entry, Instant now) {
        if (entry != null && !entry.players.isEmpty()) {
            return entry.players;
        }
        List<PlayerProfile> fallback = List.copyOf(getFallbackPlayersForGame(game));
        cache.put(game, new CacheEntry(fallback, now));
        return fallback;
    }

    private List<PlayerProfile> fetchPlayersFromApi(Game game) throws IOException, InterruptedException {
        JsonNode categoryResponse = requestJson(game, "action=query&list=categorymembers"
                + "&cmtitle=Category%3APlayers&cmnamespace=0&cmlimit=" + MAX_PLAYERS_PER_SYNC
                + "&format=json&formatversion=2");
        JsonNode members = categoryResponse.path("query").path("categorymembers");
        List<String> titles = new ArrayList<>();
        members.forEach(member -> {
            String title = member.path("title").asText("");
            if (!title.isBlank()) {
                titles.add(title);
            }
        });
        if (titles.isEmpty()) {
            return getFallbackPlayersForGame(game);
        }

        String joinedTitles = URLEncoder.encode(String.join("|", titles), StandardCharsets.UTF_8);
        JsonNode revisionResponse = requestJson(game, "action=query&titles=" + joinedTitles
                + "&prop=revisions&rvprop=content&rvslots=main&format=json&formatversion=2");
        JsonNode pages = revisionResponse.path("query").path("pages");
        List<PlayerProfile> players = new ArrayList<>();
        pages.forEach(page -> {
            String title = page.path("title").asText("");
            JsonNode revision = page.path("revisions").path(0).path("slots").path("main");
            String content = revision.has("content")
                    ? revision.path("content").asText("")
                    : revision.path("*").asText("");
            if (!title.isBlank() && !content.isBlank()) {
                PlayerProfile profile = LiquipediaWikitextParser.parse(title, game, content);
                if (profile != null) {
                    players.add(profile);
                }
            }
        });
        if (players.isEmpty()) {
            return getFallbackPlayersForGame(game);
        }
        players.sort((left, right) -> left.name().compareToIgnoreCase(right.name()));
        LOGGER.info("Loaded {} gear profiles from Liquipedia {} wiki", players.size(), game.title());
        return List.copyOf(players);
    }

    private JsonNode requestJson(Game game, String query) throws IOException, InterruptedException {
        awaitRequestSlot();
        HttpRequest request = HttpRequest.newBuilder(URI.create(game.apiUrl() + "?" + query))
                .timeout(Duration.ofSeconds(20))
                .header("User-Agent", contactEmail.isBlank()
                        ? "FRAG-Gear-Intelligence/1.0"
                        : "FRAG-Gear-Intelligence/1.0 (contact: " + contactEmail + ")")
                .header("Accept", "application/json")
                .header("Accept-Encoding", "gzip")
                .GET()
                .build();
        HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
        try (InputStream responseBody = response.body();
             InputStream decodedBody = "gzip".equalsIgnoreCase(
                     response.headers().firstValue("Content-Encoding").orElse(""))
                     ? new GZIPInputStream(responseBody)
                     : responseBody) {
            byte[] body = readFully(decodedBody);
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new LiquipediaException("Liquipedia API returned HTTP " + response.statusCode() + ".");
            }
            JsonNode json = objectMapper.readTree(body);
            if (json.has("error")) {
                throw new LiquipediaException(
                        "Liquipedia API error: " + json.path("error").path("code").asText("unknown")
                );
            }
            return json;
        }
    }

    private synchronized void awaitRequestSlot() throws InterruptedException {
        while (Instant.now().isBefore(nextRequestTime)) {
            long waitMillis = Duration.between(Instant.now(), nextRequestTime).toMillis();
            if (waitMillis > 0) {
                Thread.sleep(waitMillis);
            }
        }
        nextRequestTime = Instant.now().plus(MIN_REQUEST_INTERVAL);
    }

    private static byte[] readFully(InputStream input) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        input.transferTo(output);
        return output.toByteArray();
    }

    private static class CacheEntry {
        final List<PlayerProfile> players;
        final Instant fetchedAt;

        CacheEntry(List<PlayerProfile> players, Instant fetchedAt) {
            this.players = players;
            this.fetchedAt = fetchedAt;
        }
    }

    // ゲームごとの内蔵フォールバックデータ
    private List<PlayerProfile> getFallbackPlayersForGame(Game game) {
        List<PlayerProfile> all = List.of(
            new PlayerProfile("ImperialHal", "Apex Legends", List.of("igl"), 800, 1.0, 51.95,
                Map.of("マウス", "Finalmouse UltralightX", "マウスパッド", "Artisan Ninja FX Zero"),
                "Liquipedia (Fallback)", "https://liquipedia.net/apexlegends/ImperialHal"),
            new PlayerProfile("Genburten", "Apex Legends", List.of("fragger"), 800, 1.2, 43.30,
                Map.of("マウス", "Logitech G PRO X SUPERLIGHT 2", "マウスパッド", "Artisan Ninja FX Hayate Otsu"),
                "Liquipedia (Fallback)", "https://liquipedia.net/apexlegends/Genburten"),
            new PlayerProfile("Zero", "Apex Legends", List.of("igl"), 800, 1.4, 37.11,
                Map.of("マウス", "Razer Viper V3 Pro", "マウスパッド", "Lethal Gaming Gear Saturn Pro"),
                "Liquipedia (Fallback)", "https://liquipedia.net/apexlegends/Zero"),
            new PlayerProfile("Proper", "Overwatch 2", List.of("damage"), 800, 3.5, 49.48,
                Map.of("マウス", "Logitech G PRO X SUPERLIGHT", "マウスパッド", "Artisan Ninja FX Zero"),
                "Liquipedia (Fallback)", "https://liquipedia.net/overwatch/Proper"),
            new PlayerProfile("Lip", "Overwatch 2", List.of("damage"), 800, 3.1, 55.86,
                Map.of("マウス", "Razer Viper V3 Pro", "マウスパッド", "SteelSeries QcK Heavy"),
                "Liquipedia (Fallback)", "https://liquipedia.net/overwatch/Lip"),
            new PlayerProfile("Shu", "Overwatch 2", List.of("support"), 800, 4.0, 43.30,
                Map.of("マウス", "Logitech G PRO X SUPERLIGHT 2", "マウスパッド", "Vaxee PA"),
                "Liquipedia (Fallback)", "https://liquipedia.net/overwatch/Shu"),
            new PlayerProfile("TenZ", "VALORANT", List.of("duelist", "initiator"), 1600, 0.135, 60.49,
                Map.of("マウス", "Ninjutso Sora V2", "マウスパッド", "Artisan Ninja FX Zero"),
                "Liquipedia (Fallback)", "https://liquipedia.net/valorant/TenZ"),
            new PlayerProfile("Laz", "VALORANT", List.of("sentinel", "initiator"), 800, 0.256, 63.80,
                Map.of("マウス", "Razer Viper V3 Pro", "マウスパッド", "Vaxee PA"),
                "Liquipedia (Fallback)", "https://liquipedia.net/valorant/Laz"),
            new PlayerProfile("Something", "VALORANT", List.of("duelist"), 800, 0.65, 25.12,
                Map.of("マウス", "Logitech G PRO X SUPERLIGHT 2", "マウスパッド", "Artisan Ninja FX Zero"),
                "Liquipedia (Fallback)", "https://liquipedia.net/valorant/Something")
        );

        List<PlayerProfile> filtered = new ArrayList<>();
        for (PlayerProfile p : all) {
            if (p.game().equalsIgnoreCase(game.title())) {
                filtered.add(p);
            }
        }
        return filtered;
    }
}
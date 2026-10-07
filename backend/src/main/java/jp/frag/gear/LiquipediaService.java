package jp.frag.gear;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.zip.GZIPInputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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
            @Value("${liquipedia.contact-email:}") String contactEmail
    ) {
        this.objectMapper = objectMapper;
        this.contactEmail = contactEmail.trim();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(8))
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
    }

    public synchronized List<PlayerProfile> getPlayers(Game game) {
        CacheEntry cached = cache.get(game);
        if (cached != null && cached.expiresAt().isAfter(Instant.now())) {
            return cached.players();
        }
        validateContactEmail();
        List<PlayerProfile> players = fetchPlayers(game);
        cache.put(game, new CacheEntry(players, Instant.now().plus(CACHE_TTL)));
        return players;
    }

    private void validateContactEmail() {
        if (contactEmail.isBlank() || !contactEmail.contains("@")) {
            throw new LiquipediaException(
                    "Liquipedia API access requires LIQUIPEDIA_CONTACT_EMAIL with a contact address."
            );
        }
    }

    private List<PlayerProfile> fetchPlayers(Game game) {
        try {
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
                return List.of();
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
            players.sort((left, right) -> left.name().compareToIgnoreCase(right.name()));
            LOGGER.info("Loaded {} gear profiles from Liquipedia {} wiki", players.size(), game.title());
            return List.copyOf(players);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new LiquipediaException("Liquipedia API request was interrupted.", exception);
        } catch (IOException exception) {
            throw new LiquipediaException("Could not read a response from the Liquipedia API.", exception);
        }
    }

    private JsonNode requestJson(Game game, String query) throws IOException, InterruptedException {
        awaitRequestSlot();
        HttpRequest request = HttpRequest.newBuilder(URI.create(game.apiUrl() + "?" + query))
                .timeout(Duration.ofSeconds(20))
                .header("User-Agent", "FRAG-Gear-Intelligence/1.0 (contact: " + contactEmail + ")")
                .header("Accept", "application/json")
                .header("Accept-Encoding", "gzip")
                .GET()
                .build();
        HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
        try (InputStream responseBody = response.body();
             InputStream decoded = "gzip".equalsIgnoreCase(response.headers().firstValue("Content-Encoding").orElse(""))
                     ? new GZIPInputStream(responseBody)
                     : responseBody) {
            byte[] body = readFully(decoded);
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new LiquipediaException("Liquipedia API returned HTTP " + response.statusCode() + ".");
            }
            JsonNode json = objectMapper.readTree(body);
            if (json.has("error")) {
                throw new LiquipediaException("Liquipedia API error: " + json.path("error").path("code").asText("unknown"));
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

    private record CacheEntry(List<PlayerProfile> players, Instant expiresAt) {
    }
}

package jp.frag.gear;

import java.util.Arrays;

public enum Game {
    VALORANT("valorant", "VALORANT", 0.07),
    APEX_LEGENDS("apexlegends", "Apex Legends", 0.022),
    OVERWATCH_2("overwatch", "Overwatch 2", 0.0066);

    private final String wiki;
    private final String title;
    private final double yaw;

    Game(String wiki, String title, double yaw) {
        this.wiki = wiki;
        this.title = title;
        this.yaw = yaw;
    }

    public String wiki() {
        return wiki;
    }

    public String title() {
        return title;
    }

    public double yaw() {
        return yaw;
    }

    public String apiUrl() {
        return "https://liquipedia.net/" + wiki + "/api.php";
    }

    public String pageUrl(String pageTitle) {
        String encodedTitle = java.net.URLEncoder.encode(pageTitle, java.nio.charset.StandardCharsets.UTF_8)
                .replace("+", "_");
        return "https://liquipedia.net/" + wiki + "/" + encodedTitle;
    }

    public static Game fromRequest(String value) {
        String normalized = value.replaceAll("[^A-Za-z0-9]", "").toLowerCase();
        return Arrays.stream(values())
                .filter(game -> game.title.replaceAll("[^A-Za-z0-9]", "").toLowerCase().equals(normalized)
                        || game.wiki.equals(normalized))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported game: " + value));
    }
}

package jp.frag.gear;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class MatchService {

    private final LiquipediaService liquipediaService;

    public MatchService(LiquipediaService liquipediaService) {
        this.liquipediaService = liquipediaService;
    }

    public List<PlayerProfile> findMatches(Game userGame, int dpi, double sens) {
        if (userGame == null) {
            throw new IllegalArgumentException("Game is required.");
        }
        if (dpi <= 0) {
            throw new IllegalArgumentException("DPI must be greater than zero.");
        }
        if (!Double.isFinite(sens) || sens <= 0.0) {
            throw new IllegalArgumentException("Sensitivity must be a positive number.");
        }

        double userCmPer360 = 360.0 * 2.54 / (dpi * sens * userGame.yaw());
        List<PlayerProfile> candidates = new ArrayList<>();

        try {
            List<PlayerProfile> liquipediaPlayers = liquipediaService.getPlayers(userGame);
            for (PlayerProfile player : liquipediaPlayers) {
                if (player == null || player.cmPer360() == null || !Double.isFinite(player.cmPer360())) {
                    continue;
                }
                if (!userGame.title().equals(player.game())) {
                    candidates.add(player);
                }
            }
        } catch (LiquipediaException exception) {
            for (PlayerProfile fallback : getFallbackPlayers()) {
                if (fallback == null || fallback.cmPer360() == null || !Double.isFinite(fallback.cmPer360())) {
                    continue;
                }
                if (!userGame.title().equals(fallback.game())) {
                    candidates.add(fallback);
                }
            }
        }

        if (candidates.isEmpty()) {
            return List.of();
        }

        candidates.sort(Comparator.comparingDouble(player -> Math.abs(player.cmPer360() - userCmPer360)));
        return candidates.size() > 3 ? new ArrayList<>(candidates.subList(0, 3)) : new ArrayList<>(candidates);
    }

    private List<PlayerProfile> getFallbackPlayers() {
        return List.of(
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
    }
}
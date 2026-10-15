package jp.frag.gear;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
public class MatchService {

    private final LiquipediaService liquipediaService;

    public MatchService(LiquipediaService liquipediaService) {
        this.liquipediaService = liquipediaService;
    }

    public List<PlayerProfile> findMatches(Game userGame, int dpi, double sens) {
        double userCmPer360 = (360.0 / (dpi * sens * userGame.yaw())) * 2.54;
        List<PlayerProfile> allOtherPlayers = new ArrayList<>();

        // 1. Liquipediaからデータ取得を試みる（429エラーが出てもアプリを止めない！）
        for (Game game : Game.values()) {
            if (game == userGame) continue;
            try {
                List<PlayerProfile> players = liquipediaService.getPlayers(game);
                for (PlayerProfile player : players) {
                    if (player.cmPer360() != null && player.cmPer360() > 0) {
                        allOtherPlayers.add(player);
                    }
                }
            } catch (Exception e) {
                // 429エラー等で取得に失敗した場合は無視して次へ進む
                System.out.println(game.title() + " のAPI取得をスキップしました: " + e.getMessage());
            }
        }

        // 2. もしAPI制限(429)で1人も取得できなかった場合は、予備のプロ選手データを使う
        if (allOtherPlayers.isEmpty()) {
            for (PlayerProfile fallback : getFallbackPlayers()) {
                if (!fallback.game().equals(userGame.title())) {
                    allOtherPlayers.add(fallback);
                }
            }
        }

        // 3. 振り向き(cm/360)の差が小さい順にソートして上位3名を返す
        allOtherPlayers.sort(Comparator.comparingDouble(p -> Math.abs(p.cmPer360() - userCmPer360)));

        if (allOtherPlayers.size() > 3) {
            return allOtherPlayers.subList(0, 3);
        }
        return allOtherPlayers;
    }

    // API制限中(429)でも感度マッチとYouTube連携を止めないための予備データ
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
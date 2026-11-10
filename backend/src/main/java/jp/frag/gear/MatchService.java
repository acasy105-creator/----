package jp.frag.gear;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class MatchService {

    private final LiquipediaService liquipediaService;

    public MatchService(LiquipediaService liquipediaService) {
        this.liquipediaService = liquipediaService;
    }

    public List<PlayerProfile> findMatches(Game userGame, int dpi, double sens) {
        // 入力値の妥当性検証（極端な不正値をブロック）
        if (userGame == null || dpi < 50 || dpi > 32000 || sens <= 0 || sens > 100 || !Double.isFinite(sens)) {
            return List.of();
        }

        double userCmPer360 = (360.0 / (dpi * sens * userGame.yaw())) * 2.54;
        List<PlayerProfile> sameGamePlayers = new ArrayList<>();

        // 選択したゲームタイトル（userGame）の選手データを取得
        List<PlayerProfile> players = liquipediaService.getPlayers(userGame);
        for (PlayerProfile player : players) {
            if (player.cmPer360() != null && player.cmPer360() > 0 && Double.isFinite(player.cmPer360())) {
                sameGamePlayers.add(player);
            }
        }

        // 振り向き(cm/360)の差が小さい順にソートして上位3名を返す
        sameGamePlayers.sort(Comparator.comparingDouble(p -> Math.abs(p.cmPer360() - userCmPer360)));

        if (sameGamePlayers.size() > 3) {
            return sameGamePlayers.subList(0, 3);
        }
        return sameGamePlayers;
    }
}
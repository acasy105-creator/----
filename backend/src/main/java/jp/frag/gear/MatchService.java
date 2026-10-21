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
        if (dpi <= 0 || sens <= 0) {
            return List.of();
        }

        double userCmPer360 = (360.0 / (dpi * sens * userGame.yaw())) * 2.54;
        List<PlayerProfile> allOtherPlayers = new ArrayList<>();

        // LiquipediaServiceから他タイトルの選手データを取得（API制限時も自動で30名の予備データが返る）
        for (Game game : Game.values()) {
            if (game == userGame) continue;
            List<PlayerProfile> players = liquipediaService.getPlayers(game);
            for (PlayerProfile player : players) {
                if (player.cmPer360() != null && player.cmPer360() > 0 && Double.isFinite(player.cmPer360())) {
                    allOtherPlayers.add(player);
                }
            }
        }

        // 振り向き(cm/360)の差が小さい順にソートして上位3名を返す
        allOtherPlayers.sort(Comparator.comparingDouble(p -> Math.abs(p.cmPer360() - userCmPer360)));

        if (allOtherPlayers.size() > 3) {
            return allOtherPlayers.subList(0, 3);
        }
        return allOtherPlayers;
    }
}
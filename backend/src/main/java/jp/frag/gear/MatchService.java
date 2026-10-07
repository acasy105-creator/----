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
        // ユーザーの振り向き（cm/360）を計算
        double userCmPer360 = (360.0 / (dpi * sens * userGame.yaw())) * 2.54;

        List<PlayerProfile> allOtherPlayers = new ArrayList<>();

        // すべてのゲームタイトルを順番にチェック
        for (Game game : Game.values()) {
            if (game == userGame) continue; // 自分が選んだゲームは除外

            List<PlayerProfile> players = liquipediaService.getPlayers(game);
            for (PlayerProfile player : players) {
                // Parserが計算してくれた cmPer360 を持っている選手だけ追加
                if (player.cmPer360() != null && player.cmPer360() > 0) {
                    allOtherPlayers.add(player);
                }
            }
        }

        // 差が小さい順に並び替え
        allOtherPlayers.sort(Comparator.comparingDouble(p -> Math.abs(p.cmPer360() - userCmPer360)));

        // 上位3名だけを返す
        if (allOtherPlayers.size() > 3) {
            return allOtherPlayers.subList(0, 3);
        }
        return allOtherPlayers;
    }
}
package jp.frag.gear;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping("/api/match")
    public List<PlayerProfile> getMatchingPlayers(
            @RequestParam String game,
            @RequestParam int dpi,
            @RequestParam double sens) {
        
        return matchService.findMatches(Game.fromRequest(game), dpi, sens);
    }
}
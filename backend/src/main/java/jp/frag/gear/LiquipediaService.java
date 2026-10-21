package jp.frag.gear;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
public class LiquipediaService {

    private static final Logger LOGGER = LoggerFactory.getLogger(LiquipediaService.class);
    private static final Duration CACHE_TTL = Duration.ofHours(24);

    private final ObjectMapper objectMapper;
    private final Map<Game, CacheEntry> cache = new EnumMap<>(Game.class);
    private final List<PlayerProfile> bundledDataset;

    public LiquipediaService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.bundledDataset = loadBundledDataset();
    }

    private List<PlayerProfile> loadBundledDataset() {
        List<PlayerProfile> defaults = createDefaultDataset();
        ClassPathResource resource = new ClassPathResource("players-dataset.json");
        if (resource.exists()) {
            try (InputStream is = resource.getInputStream()) {
                List<PlayerProfile> loaded = objectMapper.readValue(is, new TypeReference<List<PlayerProfile>>() {});
                if (loaded != null && !loaded.isEmpty()) {
                    // JSONファイルと内蔵データ(ストリーマー・VTuber含む)を重複なしで自動統合
                    Map<String, PlayerProfile> merged = new LinkedHashMap<>();
                    for (PlayerProfile p : defaults) merged.put(p.name().toLowerCase(Locale.ROOT), p);
                    for (PlayerProfile p : loaded) merged.put(p.name().toLowerCase(Locale.ROOT), p);
                    LOGGER.info("統合データセットを読み込みました: 計 {} 名", merged.size());
                    return new ArrayList<>(merged.values());
                }
            } catch (Exception e) {
                LOGGER.warn("players-dataset.json の読み込みに失敗したため、内蔵データセットを使用します: {}", e.getMessage());
            }
        }
        return defaults;
    }

    public synchronized List<PlayerProfile> getPlayers(Game game) {
        CacheEntry entry = cache.get(game);
        Instant now = Instant.now();

        if (entry != null && Duration.between(entry.fetchedAt, now).compareTo(CACHE_TTL) < 0) {
            return entry.players;
        }

        List<PlayerProfile> players = getBundledPlayersForGame(game);
        cache.put(game, new CacheEntry(players, now));
        return players;
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

    private static class CacheEntry {
        final List<PlayerProfile> players;
        final Instant fetchedAt;

        CacheEntry(List<PlayerProfile> players, Instant fetchedAt) {
            this.players = players;
            this.fetchedAt = fetchedAt;
        }
    }

    // プロ60名 ＋ 人気ストリーマー・VTuber 25名（計85名データセット）
    private List<PlayerProfile> createDefaultDataset() {
        String json = """
        [
          {"name":"TenZ","game":"VALORANT","roles":["pro","duelist","initiator"],"dpi":1600,"sens":0.135,"cmPer360":60.49,"devices":{"マウス":"Ninjutso Sora V2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Xtrfy H1"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/valorant/TenZ"},
          {"name":"Laz","game":"VALORANT","roles":["pro","sentinel","initiator"],"dpi":800,"sens":0.256,"cmPer360":63.80,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"Vaxee PA","ヘッドセット":"Razer BlackShark V2 Pro"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/valorant/Laz"},
          {"name":"Something","game":"VALORANT","roles":["pro","duelist"],"dpi":800,"sens":0.65,"cmPer360":25.12,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/valorant/Something"},
          {"name":"Aspas","game":"VALORANT","roles":["pro","duelist"],"dpi":800,"sens":0.40,"cmPer360":40.82,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Logicool G PRO X 2"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/valorant/aspas"},
          {"name":"Demon1","game":"VALORANT","roles":["pro","duelist","controller"],"dpi":1600,"sens":0.10,"cmPer360":81.64,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/valorant/Demon1"},
          {"name":"Dep","game":"VALORANT","roles":["pro","duelist","initiator"],"dpi":400,"sens":0.45,"cmPer360":72.57,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"Artisan Ninja FX Hayate Otsu","ヘッドセット":"Razer BlackShark V2 Pro"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/valorant/Dep"},
          {"name":"Meiy","game":"VALORANT","roles":["pro","duelist"],"dpi":800,"sens":0.20,"cmPer360":81.64,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Logicool G PRO X 2"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/valorant/Meiy"},
          {"name":"Chronicle","game":"VALORANT","roles":["pro","initiator","sentinel"],"dpi":800,"sens":0.25,"cmPer360":65.31,"devices":{"マウス":"WLmouse Beast X","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Sony INZONE H9"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/valorant/Chronicle"},
          {"name":"Boaster","game":"VALORANT","roles":["pro","controller"],"dpi":800,"sens":0.27,"cmPer360":60.48,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"ZOWIE G-SR-SE","ヘッドセット":"Sony INZONE H9"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/valorant/Boaster"},
          {"name":"f0rsakeN","game":"VALORANT","roles":["pro","initiator","controller"],"dpi":800,"sens":0.712,"cmPer360":22.93,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Hien","ヘッドセット":"Razer BlackShark V2 Pro"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/valorant/f0rsakeN"},
          {"name":"ZmjjKK","game":"VALORANT","roles":["pro","duelist"],"dpi":800,"sens":0.32,"cmPer360":51.03,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Vaxee PA","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/valorant/ZmjjKK"},
          {"name":"Alfajer","game":"VALORANT","roles":["pro","sentinel","duelist"],"dpi":400,"sens":0.45,"cmPer360":72.57,"devices":{"マウス":"Razer DeathAdder V3 Pro","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Sony INZONE H9"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/valorant/Alfajer"},
          {"name":"Leo","game":"VALORANT","roles":["pro","initiator"],"dpi":400,"sens":0.33,"cmPer360":98.96,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Sony INZONE H9"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/valorant/Leo"},
          {"name":"Less","game":"VALORANT","roles":["pro","sentinel"],"dpi":800,"sens":0.22,"cmPer360":74.22,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"Vaxee PA","ヘッドセット":"Razer BlackShark V2 Pro"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/valorant/Less"},
          {"name":"zekken","game":"VALORANT","roles":["pro","duelist","initiator"],"dpi":800,"sens":0.35,"cmPer360":46.65,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/valorant/zekken"},
          {"name":"SugarZ3ro","game":"VALORANT","roles":["pro","controller"],"dpi":800,"sens":0.23,"cmPer360":70.99,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Razer BlackShark V2 Pro"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/valorant/SugarZ3ro"},
          {"name":"nAts","game":"VALORANT","roles":["pro","sentinel","controller"],"dpi":800,"sens":0.49,"cmPer360":33.32,"devices":{"マウス":"ZOWIE EC2-CW","マウスパッド":"ZOWIE G-SR-SE","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/valorant/nAts"},
          {"name":"Jinggg","game":"VALORANT","roles":["pro","duelist"],"dpi":1600,"sens":0.18,"cmPer360":45.36,"devices":{"マウス":"Finalmouse UltralightX","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Razer BlackShark V2 Pro"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/valorant/Jinggg"},
          {"name":"MaKo","game":"VALORANT","roles":["pro","controller"],"dpi":400,"sens":0.45,"cmPer360":72.57,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"SteelSeries QcK Heavy","ヘッドセット":"Razer BlackShark V2 Pro"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/valorant/MaKo"},
          {"name":"t3xture","game":"VALORANT","roles":["pro","duelist"],"dpi":800,"sens":0.30,"cmPer360":54.43,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Logicool G PRO X 2"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/valorant/t3xture"},

          {"name":"釈迦 (SHAKA)","game":"VALORANT","roles":["streamer","initiator","sentinel"],"dpi":800,"sens":0.27,"cmPer360":60.48,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Sennheiser HD 599"},"source":"Streamer Gear DB","sourceUrl":"https://www.twitch.tv/fps_shaka"},
          {"name":"だるまいずごっと (Daruma is God)","game":"VALORANT","roles":["streamer","duelist"],"dpi":800,"sens":0.28,"cmPer360":58.32,"devices":{"マウス":"Finalmouse UltralightX","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Apple EarPods"},"source":"Streamer Gear DB","sourceUrl":"https://www.youtube.com/@darumaisgod"},
          {"name":"ありさか (Arisakaaa)","game":"VALORANT","roles":["streamer","sentinel","controller"],"dpi":800,"sens":0.30,"cmPer360":54.43,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Logicool G640","ヘッドセット":"Razer BlackShark V2"},"source":"Streamer Gear DB","sourceUrl":"https://www.youtube.com/@Arisakaaa"},
          {"name":"葛葉 (Kuzuha)","game":"VALORANT","roles":["vtuber","duelist","initiator"],"dpi":800,"sens":0.31,"cmPer360":52.67,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Logicool G640","ヘッドセット":"SHURE SE215"},"source":"VTuber Gear DB","sourceUrl":"https://www.youtube.com/@Kuzuha"},
          {"name":"ローレン・イロアス (Lauren Iroas)","game":"VALORANT","roles":["vtuber","duelist","initiator"],"dpi":800,"sens":0.29,"cmPer360":56.31,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"SHURE SE215"},"source":"VTuber Gear DB","sourceUrl":"https://www.youtube.com/@LaurenIroas"},
          {"name":"夢野あかり (Akari Yumeno / ぶいすぽっ！)","game":"VALORANT","roles":["vtuber","duelist","controller"],"dpi":800,"sens":0.30,"cmPer360":54.43,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"SHURE SE215"},"source":"VTuber Gear DB","sourceUrl":"https://www.twitch.tv/akarindao"},
          {"name":"胡桃のあ (Noah Kurumi / ぶいすぽっ！)","game":"VALORANT","roles":["vtuber","controller","sentinel"],"dpi":800,"sens":0.25,"cmPer360":65.31,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Sony INZONE Buds"},"source":"VTuber Gear DB","sourceUrl":"https://www.youtube.com/@KurumiNoah"},
          {"name":"橘ひなの (Hinano Tachibana / ぶいすぽっ！)","game":"VALORANT","roles":["vtuber","controller","initiator"],"dpi":800,"sens":0.23,"cmPer360":70.99,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Vaxee PA","ヘッドセット":"SHURE SE215"},"source":"VTuber Gear DB","sourceUrl":"https://www.youtube.com/@TachibanaHinano"},
          {"name":"一ノ瀬うるは (Uruha Ichinose / ぶいすぽっ！)","game":"VALORANT","roles":["vtuber","sentinel","initiator"],"dpi":800,"sens":0.26,"cmPer360":62.80,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Sennheiser IE 100 PRO"},"source":"VTuber Gear DB","sourceUrl":"https://www.youtube.com/@IchinoseUruha"},
          {"name":"小森めと (Met Komori / ぶいすぽっ！)","game":"VALORANT","roles":["vtuber","sentinel","controller"],"dpi":800,"sens":0.24,"cmPer360":68.04,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Vaxee PA","ヘッドセット":"Apple EarPods"},"source":"VTuber Gear DB","sourceUrl":"https://www.youtube.com/@Met_Komori"},
          {"name":"白波らむね (Ramune Shiranami / ぶいすぽっ！)","game":"VALORANT","roles":["vtuber","duelist","initiator"],"dpi":800,"sens":0.28,"cmPer360":58.32,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"SHURE SE215"},"source":"VTuber Gear DB","sourceUrl":"https://www.youtube.com/@ShiranamiRamune"},
          {"name":"八雲べに (Beni Yakumo / ぶいすぽっ！)","game":"VALORANT","roles":["vtuber","controller","sentinel"],"dpi":800,"sens":0.25,"cmPer360":65.31,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Vaxee PA","ヘッドセット":"SHURE SE215"},"source":"VTuber Gear DB","sourceUrl":"https://www.youtube.com/@YakumoBeni"},
          {"name":"猫麦とろろ (Tororo Nekomugi)","game":"VALORANT","roles":["vtuber","sentinel"],"dpi":800,"sens":0.22,"cmPer360":74.22,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Sony INZONE H9"},"source":"VTuber Gear DB","sourceUrl":"https://www.twitch.tv/tororo_vtuber"},
          {"name":"ボドカ (Vodka)","game":"VALORANT","roles":["streamer","initiator"],"dpi":800,"sens":0.27,"cmPer360":60.48,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Sennheiser IE 400 PRO"},"source":"Streamer Gear DB","sourceUrl":"https://www.youtube.com/@VodkaCh"},
          {"name":"じゃすぱー (Jasper7se)","game":"VALORANT","roles":["streamer","controller","sentinel"],"dpi":800,"sens":0.235,"cmPer360":69.48,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Vaxee PA","ヘッドセット":"Apple EarPods"},"source":"Streamer Gear DB","sourceUrl":"https://www.twitch.tv/jasper7se"},

          {"name":"ImperialHal","game":"Apex Legends","roles":["pro","igl"],"dpi":800,"sens":1.0,"cmPer360":51.95,"devices":{"マウス":"Finalmouse UltralightX","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Razer BlackShark V2 Pro"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/apexlegends/ImperialHal"},
          {"name":"Genburten","game":"Apex Legends","roles":["pro","fragger"],"dpi":800,"sens":1.2,"cmPer360":43.30,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Hayate Otsu","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/apexlegends/Genburten"},
          {"name":"Zero","game":"Apex Legends","roles":["pro","igl"],"dpi":800,"sens":1.4,"cmPer360":37.11,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"Lethal Gaming Gear Saturn Pro","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/apexlegends/Zer0"},
          {"name":"YukaF","game":"Apex Legends","roles":["pro","fragger"],"dpi":800,"sens":1.5,"cmPer360":34.64,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"Wallhack SP-004","ヘッドセット":"Sony INZONE Buds"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/apexlegends/YukaF"},
          {"name":"Sweetdreams","game":"Apex Legends","roles":["pro","igl"],"dpi":800,"sens":1.2,"cmPer360":43.30,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Logicool G PRO X 2"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/apexlegends/Sweetdreams"},
          {"name":"HisWattson","game":"Apex Legends","roles":["pro","fragger","support"],"dpi":1600,"sens":0.75,"cmPer360":34.64,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Raiden","ヘッドセット":"HyperX Cloud Alpha"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/apexlegends/HisWattson"},
          {"name":"iiTzTimmy","game":"Apex Legends","roles":["pro","streamer","fragger","igl"],"dpi":1800,"sens":1.1,"cmPer360":20.99,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Logicool G640","ヘッドセット":"Logicool G PRO X 2"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/apexlegends/iiTzTimmy"},
          {"name":"Mande","game":"Apex Legends","roles":["pro","streamer","fragger","support"],"dpi":800,"sens":1.4,"cmPer360":37.11,"devices":{"マウス":"Razer DeathAdder V3 Pro","マウスパッド":"SteelSeries QcK Heavy","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/apexlegends/Mande"},
          {"name":"Reps","game":"Apex Legends","roles":["pro","support"],"dpi":800,"sens":1.3,"cmPer360":39.96,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Razer BlackShark V2 Pro"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/apexlegends/Reps"},
          {"name":"Meltstera","game":"Apex Legends","roles":["pro","fragger","support"],"dpi":1600,"sens":0.65,"cmPer360":39.96,"devices":{"マウス":"Vaxee XE Wireless","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"SHURE SE215"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/apexlegends/Meltstera"},
          {"name":"aceu","game":"Apex Legends","roles":["streamer","fragger"],"dpi":800,"sens":1.5,"cmPer360":34.64,"devices":{"マウス":"Finalmouse UltralightX","マウスパッド":"Artisan Ninja FX Hien","ヘッドセット":"Beyerdynamic DT 990 PRO"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/apexlegends/Aceu"},
          {"name":"Albralelie","game":"Apex Legends","roles":["pro","support","fragger"],"dpi":800,"sens":1.2,"cmPer360":43.30,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/apexlegends/Albralelie"},
          {"name":"Dropped","game":"Apex Legends","roles":["pro","igl","support"],"dpi":800,"sens":1.3,"cmPer360":39.96,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"Lethal Gaming Gear Saturn Pro","ヘッドセット":"SteelSeries Arctis Nova Pro"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/apexlegends/Dropped"},
          {"name":"Nocturnal","game":"Apex Legends","roles":["pro","igl"],"dpi":800,"sens":1.1,"cmPer360":47.23,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/apexlegends/Nocturnal"},
          {"name":"FunFPS","game":"Apex Legends","roles":["pro","support","fragger"],"dpi":800,"sens":1.5,"cmPer360":34.64,"devices":{"マウス":"Vaxee XE Wireless","マウスパッド":"Vaxee PA","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/apexlegends/FunFPS"},
          {"name":"Obly","game":"Apex Legends","roles":["pro","igl","fragger"],"dpi":800,"sens":1.25,"cmPer360":41.56,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"SHURE SE215"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/apexlegends/Obly"},
          {"name":"KaronPe","game":"Apex Legends","roles":["pro","fragger"],"dpi":800,"sens":1.35,"cmPer360":38.48,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Hayate Otsu","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/apexlegends/KaronPe"},
          {"name":"SangJoon","game":"Apex Legends","roles":["pro","support","fragger"],"dpi":800,"sens":1.4,"cmPer360":37.11,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"Wallhack SP-004","ヘッドセット":"Razer BlackShark V2 Pro"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/apexlegends/SangJoon"},
          {"name":"Hakis","game":"Apex Legends","roles":["pro","igl","support"],"dpi":1600,"sens":0.55,"cmPer360":47.23,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Sony INZONE Buds"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/apexlegends/Hakis"},
          {"name":"rpr","game":"Apex Legends","roles":["streamer","pro","igl"],"dpi":800,"sens":1.5,"cmPer360":34.64,"devices":{"マウス":"Finalmouse UltralightX","マウスパッド":"Wallhack SP-004","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/apexlegends/Rpr"},

          {"name":"渋谷ハル (ShibuyaHAL)","game":"Apex Legends","roles":["vtuber","igl","fragger"],"dpi":800,"sens":1.1,"cmPer360":47.23,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Sennheiser IE 400 PRO"},"source":"VTuber Gear DB","sourceUrl":"https://www.youtube.com/@ShibuyaHAL"},
          {"name":"Selly","game":"Apex Legends","roles":["streamer","pro","fragger"],"dpi":800,"sens":1.5,"cmPer360":34.64,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Logicool G640","ヘッドセット":"Apple EarPods"},"source":"Streamer Gear DB","sourceUrl":"https://www.twitch.tv/selly55"},
          {"name":"Mondo","game":"Apex Legends","roles":["streamer","pro","fragger"],"dpi":400,"sens":2.0,"cmPer360":51.95,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"ZOWIE G-SR-SE","ヘッドセット":"Bose QuietComfort 20"},"source":"Streamer Gear DB","sourceUrl":"https://www.twitch.tv/mondo2244"},
          {"name":"Cpt","game":"Apex Legends","roles":["streamer","pro","fragger"],"dpi":1600,"sens":0.6,"cmPer360":43.30,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Logicool G640","ヘッドセット":"Bose QuietComfort 20"},"source":"Streamer Gear DB","sourceUrl":"https://www.youtube.com/@cpt55"},
          {"name":"Ras","game":"Apex Legends","roles":["pro","streamer","fragger"],"dpi":1200,"sens":1.1,"cmPer360":31.49,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT","マウスパッド":"Logicool G640","ヘッドセット":"Bose QuietComfort 20"},"source":"Streamer Gear DB","sourceUrl":"https://www.youtube.com/@Ras_99"},
          {"name":"勇気ちひろ (Chihiro Yuki)","game":"Apex Legends","roles":["vtuber","igl","support"],"dpi":800,"sens":1.2,"cmPer360":43.30,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT","マウスパッド":"Logicool G640","ヘッドセット":"Logicool G PRO X"},"source":"VTuber Gear DB","sourceUrl":"https://www.youtube.com/"},
          {"name":"花芽すみれ (Sumire Kaga / ぶいすぽっ！)","game":"Apex Legends","roles":["vtuber","fragger","support"],"dpi":800,"sens":1.3,"cmPer360":39.96,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"SHURE SE215"},"source":"VTuber Gear DB","sourceUrl":"https://www.youtube.com/@KagaSumire"},
          {"name":"花芽なずな (Nazuna Kaga / ぶいすぽっ！)","game":"Apex Legends","roles":["vtuber","fragger"],"dpi":800,"sens":1.4,"cmPer360":37.11,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Vaxee PA","ヘッドセット":"SHURE SE215"},"source":"VTuber Gear DB","sourceUrl":"https://www.youtube.com/@KagaNazuna"},

          {"name":"Proper","game":"Overwatch 2","roles":["pro","damage"],"dpi":800,"sens":3.5,"cmPer360":49.48,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/overwatch/Proper"},
          {"name":"Lip","game":"Overwatch 2","roles":["pro","damage"],"dpi":800,"sens":3.1,"cmPer360":55.86,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"SteelSeries QcK Heavy","ヘッドセット":"Razer BlackShark V2 Pro"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/overwatch/LIP"},
          {"name":"Shu","game":"Overwatch 2","roles":["pro","support"],"dpi":800,"sens":4.0,"cmPer360":43.30,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Vaxee PA","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/overwatch/Shu"},
          {"name":"Fielder","game":"Overwatch 2","roles":["pro","support"],"dpi":800,"sens":5.0,"cmPer360":34.64,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Logicool G PRO X 2"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/overwatch/Fielder"},
          {"name":"Chiyo","game":"Overwatch 2","roles":["pro","support"],"dpi":1600,"sens":3.5,"cmPer360":24.74,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"Artisan Ninja FX Hayate Otsu","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/overwatch/ChiYo"},
          {"name":"Smurf","game":"Overwatch 2","roles":["pro","tank"],"dpi":800,"sens":6.5,"cmPer360":26.64,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"SteelSeries QcK Heavy","ヘッドセット":"Logicool G PRO X"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/overwatch/Smurf"},
          {"name":"Fearless","game":"Overwatch 2","roles":["pro","tank"],"dpi":1600,"sens":4.5,"cmPer360":19.24,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT","マウスパッド":"Logicool G640","ヘッドセット":"HyperX Cloud Alpha"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/overwatch/Fearless"},
          {"name":"Shy","game":"Overwatch 2","roles":["pro","damage"],"dpi":800,"sens":3.5,"cmPer360":49.48,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/overwatch/Shy"},
          {"name":"Leave","game":"Overwatch 2","roles":["pro","damage"],"dpi":800,"sens":5.5,"cmPer360":31.49,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Hien","ヘッドセット":"Razer BlackShark V2 Pro"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/overwatch/Leave"},
          {"name":"Viol2t","game":"Overwatch 2","roles":["pro","support"],"dpi":800,"sens":4.5,"cmPer360":38.48,"devices":{"マウス":"Razer DeathAdder V3 Pro","マウスパッド":"ZOWIE G-SR-SE","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/overwatch/Viol2t"},
          {"name":"Hanbin","game":"Overwatch 2","roles":["pro","tank"],"dpi":1600,"sens":2.5,"cmPer360":34.64,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/overwatch/Hanbin"},
          {"name":"Sparkle","game":"Overwatch 2","roles":["pro","damage"],"dpi":1600,"sens":4.2,"cmPer360":20.62,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Logicool G640","ヘッドセット":"Razer BlackShark V2 Pro"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/overwatch/Sp9rk1e"},
          {"name":"Kevster","game":"Overwatch 2","roles":["pro","damage"],"dpi":800,"sens":4.5,"cmPer360":38.48,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/overwatch/Kevster"},
          {"name":"Profit","game":"Overwatch 2","roles":["pro","damage"],"dpi":800,"sens":5.25,"cmPer360":32.99,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT","マウスパッド":"SteelSeries QcK Heavy","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/overwatch/Profit"},
          {"name":"Fleta","game":"Overwatch 2","roles":["pro","damage"],"dpi":800,"sens":4.0,"cmPer360":43.30,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"ZOWIE G-SR-SE","ヘッドセット":"Razer BlackShark V2 Pro"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/overwatch/Fleta"},
          {"name":"Twilight","game":"Overwatch 2","roles":["pro","support"],"dpi":800,"sens":3.8,"cmPer360":45.57,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Vaxee PA","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/overwatch/Twilight"},
          {"name":"Someone","game":"Overwatch 2","roles":["pro","tank"],"dpi":800,"sens":6.0,"cmPer360":28.86,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Logicool G PRO X 2"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/overwatch/Someone"},
          {"name":"Mer1t","game":"Overwatch 2","roles":["pro","damage"],"dpi":800,"sens":3.2,"cmPer360":54.12,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/overwatch/MER1T"},
          {"name":"Chorong","game":"Overwatch 2","roles":["pro","support"],"dpi":1600,"sens":3.0,"cmPer360":28.86,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Hayate Otsu","ヘッドセット":"HyperX Cloud II"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/overwatch/Ch0r0ng"},
          {"name":"Stalk3r","game":"Overwatch 2","roles":["pro","damage"],"dpi":800,"sens":4.2,"cmPer360":41.23,"devices":{"マウス":"Razer Viper V3 Pro","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Razer BlackShark V2 Pro"},"source":"ProSettings / Liquipedia","sourceUrl":"https://liquipedia.net/overwatch/Stalk3r"},

          {"name":"ta1yo","game":"Overwatch 2","roles":["streamer","pro","damage"],"dpi":800,"sens":4.5,"cmPer360":38.48,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Zero","ヘッドセット":"Apple EarPods"},"source":"Streamer Gear DB","sourceUrl":"https://www.twitch.tv/ta1yo_tv"},
          {"name":"SPYGEA (スパイギア)","game":"Overwatch 2","roles":["streamer","damage"],"dpi":800,"sens":4.0,"cmPer360":43.30,"devices":{"マウス":"Logicool G PRO X SUPERLIGHT 2","マウスパッド":"Artisan Ninja FX Hien","ヘッドセット":"Sennheiser HD 660S2"},"source":"Streamer Gear DB","sourceUrl":"https://www.twitch.tv/spygea"}
        ]
        """;
        try {
            return objectMapper.readValue(json, new TypeReference<List<PlayerProfile>>() {});
        } catch (Exception e) {
            LOGGER.error("内蔵JSONデータセットのパースに失敗しました: {}", e.getMessage());
            return List.of();
        }
    }
}
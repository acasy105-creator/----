package jp.frag.gear;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

final class LiquipediaWikitextParser {
    private static final Set<String> GEAR_TEMPLATES = Set.of("hardware table", "mouse settings table");
    private static final Pattern REF_TAG = Pattern.compile("(?is)<ref\\b[^>]*/\\s*>|<ref\\b[^>]*>.*?</ref\\s*>");
    private static final Pattern COMMENT = Pattern.compile("(?s)<!--.*?-->");
    private static final Pattern WIKI_LINK = Pattern.compile("\\[\\[(?:[^\\]|]*\\|)?([^\\]]+)]]");
    private static final Pattern INTEGER = Pattern.compile("\\d+");
    private static final Pattern DECIMAL = Pattern.compile("-?(?:\\d+(?:[.,]\\d+)?|[.,]\\d+)");

    private LiquipediaWikitextParser() {
    }

    static PlayerProfile parse(String title, Game game, String wikitext) {
        Map<String, String> devices = new LinkedHashMap<>();
        Integer dpi = null;
        Double sensitivity = null;

        for (String template : findGearTemplates(wikitext)) {
            Map<String, String> fields = parseFields(template);
            String templateName = templateName(template);
            if (templateName.equals("hardware table")) {
                addDevice(devices, "マウス", fields, "mouse");
                addDevice(devices, "マウスパッド", fields, "pad");
                addDevice(devices, "キーボード", fields, "keyboard");
                addDevice(devices, "ヘッドセット", fields, "headset");
                addDevice(devices, "モニター", fields, "monitor");
            } else {
                addDevice(devices, "マウス", fields, "");
                dpi = parseInteger(fields.get("dpi"));
                sensitivity = parseDouble(fields.get("sensitivity"));
            }
        }

        if (devices.isEmpty()) {
            return null;
        }

        Double cmPer360 = dpi != null && sensitivity != null && dpi > 0 && sensitivity > 0
                ? 360 * 2.54 / (dpi * sensitivity * game.yaw())
                : null;
        return new PlayerProfile(
                title,
                game.title(),
                List.of(),
                dpi,
                sensitivity,
                cmPer360,
                Map.copyOf(devices),
                "Liquipedia (CC BY-SA 3.0)",
                game.pageUrl(title)
        );
    }

    private static List<String> findGearTemplates(String text) {
        List<String> templates = new ArrayList<>();
        int cursor = 0;
        while (cursor < text.length() - 1) {
            int start = text.indexOf("{{", cursor);
            if (start < 0) {
                break;
            }
            int depth = 1;
            int index = start + 2;
            while (index < text.length() - 1 && depth > 0) {
                if (text.startsWith("{{", index)) {
                    depth++;
                    index += 2;
                } else if (text.startsWith("}}", index)) {
                    depth--;
                    index += 2;
                } else {
                    index++;
                }
            }
            if (depth == 0) {
                String template = text.substring(start + 2, index - 2);
                if (GEAR_TEMPLATES.contains(templateName(template))) {
                    templates.add(template);
                }
                cursor = index;
            } else {
                break;
            }
        }
        return templates;
    }

    private static Map<String, String> parseFields(String template) {
        Map<String, String> fields = new LinkedHashMap<>();
        List<String> parts = splitAtTopLevel(template, '|');
        for (int index = 1; index < parts.size(); index++) {
            List<String> keyValue = splitAtTopLevel(parts.get(index), '=');
            if (keyValue.size() < 2) {
                continue;
            }
            String key = clean(keyValue.get(0)).toLowerCase(Locale.ROOT);
            String value = clean(String.join("=", keyValue.subList(1, keyValue.size())));
            if (!key.isBlank() && !value.isBlank()) {
                fields.put(key, value);
            }
        }
        return fields;
    }

    private static List<String> splitAtTopLevel(String value, char delimiter) {
        List<String> parts = new ArrayList<>();
        int templateDepth = 0;
        int linkDepth = 0;
        int start = 0;
        for (int index = 0; index < value.length(); index++) {
            if (value.startsWith("{{", index)) {
                templateDepth++;
                index++;
            } else if (value.startsWith("}}", index) && templateDepth > 0) {
                templateDepth--;
                index++;
            } else if (value.startsWith("[[", index)) {
                linkDepth++;
                index++;
            } else if (value.startsWith("]]", index) && linkDepth > 0) {
                linkDepth--;
                index++;
            } else if (value.charAt(index) == delimiter && templateDepth == 0 && linkDepth == 0) {
                parts.add(value.substring(start, index));
                start = index + 1;
            }
        }
        parts.add(value.substring(start));
        return parts;
    }

    private static String templateName(String template) {
        int separator = template.indexOf('|');
        return (separator < 0 ? template : template.substring(0, separator)).trim().toLowerCase(Locale.ROOT);
    }

    private static String clean(String value) {
        String withoutMarkup = COMMENT.matcher(REF_TAG.matcher(value).replaceAll("")).replaceAll("").trim();
        Matcher linkMatcher = WIKI_LINK.matcher(withoutMarkup);
        StringBuffer result = new StringBuffer();
        while (linkMatcher.find()) {
            linkMatcher.appendReplacement(result, Matcher.quoteReplacement(linkMatcher.group(1).trim()));
        }
        linkMatcher.appendTail(result);
        return result.toString().replaceAll("(?s)<[^>]*>", "").trim();
    }

    private static void addDevice(Map<String, String> devices, String category, Map<String, String> fields, String prefix) {
        String brand = fields.get(prefix.isEmpty() ? "brand" : prefix + "-brand");
        String model = fields.get(prefix.isEmpty() ? "model" : prefix + "-model");
        String value = Stream.of(brand, model)
                .filter(item -> item != null && !item.isBlank())
                .distinct()
                .reduce((left, right) -> left + " " + right)
                .orElse("");
        if (!value.isBlank()) {
            devices.put(category, value);
        }
    }

    private static Integer parseInteger(String value) {
        if (value == null) {
            return null;
        }
        Matcher matcher = INTEGER.matcher(value);
        return matcher.find() ? Integer.valueOf(matcher.group()) : null;
    }

    private static Double parseDouble(String value) {
        if (value == null) {
            return null;
        }
        Matcher matcher = DECIMAL.matcher(value);
        if (!matcher.find()) {
            return null;
        }
        try {
            return Double.valueOf(matcher.group().replace(",", "."));
        } catch (NumberFormatException exception) {
            return null;
        }
    }
}

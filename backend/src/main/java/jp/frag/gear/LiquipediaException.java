package jp.frag.gear;

public class LiquipediaException extends RuntimeException {
    public LiquipediaException(String message) {
        super(message);
    }

    public LiquipediaException(String message, Throwable cause) {
        super(message, cause);
    }
}

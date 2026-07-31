package com.taekwondo.sdmaa.security;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

public class XssSanitizer {

    private XssSanitizer() {
    }

    public static String clean(String value) {
        if (value == null) {
            return null;
        }

        return Jsoup.clean(value, Safelist.none()).trim();
    }
}

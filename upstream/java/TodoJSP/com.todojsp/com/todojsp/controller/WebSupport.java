package com.todojsp.controller;

import javax.servlet.http.HttpServletRequest;
import java.security.SecureRandom;
import java.util.Base64;

final class WebSupport {
    private WebSupport() { }
    static int id(HttpServletRequest request) {
        try {
            int id = Integer.parseInt(request.getParameter("id"));
            if (id > 0) { return id; }
        } catch (NumberFormatException e) { /* 共通の入力エラーにする。 */ }
        throw new IllegalArgumentException("IDは1以上の整数で入力してください。");
    }
    static String token(HttpServletRequest request) {
        String token = (String) request.getSession().getAttribute("csrf");
        if (token == null) {
            byte[] bytes = new byte[32];
            new SecureRandom().nextBytes(bytes);
            token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
            request.getSession().setAttribute("csrf", token);
        }
        return token;
    }
    static boolean validToken(HttpServletRequest request) {
        Object token = request.getSession().getAttribute("csrf");
        return token != null && token.equals(request.getParameter("csrf"));
    }
}

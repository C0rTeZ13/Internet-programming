package com.example.lab7;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/loggedIn")
public class LoggedInServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Проверка наличия и значений cookie
        String loginCookie = null;
        String passwordCookie = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("login")) {
                    loginCookie = cookie.getValue();
                } else if (cookie.getName().equals("password")) {
                    passwordCookie = cookie.getValue();
                }
            }
        }

        // Проверка cookie
        if (loginCookie == null || passwordCookie == null || loginCookie.equals("") || passwordCookie.equals("")) {
            // Перенаправление на страницу index.jsp
            response.sendRedirect("index.jsp");
        }
    }
}

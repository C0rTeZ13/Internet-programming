package com.example.lab7;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

@WebServlet("/checkAuth")
public class CheckAuthServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String login = request.getParameter("login");
        String password = request.getParameter("password");
        boolean isAuthorized = false;

        String filePath = getServletContext().getRealPath("/usersDb.txt");

        if (Files.exists(Paths.get(filePath))) {
            String[] users = Files.readAllLines(Paths.get(filePath)).toArray(String[]::new);
            for (int i = 0; i < users.length; i += 2) {
                if (users[i].equals(login) && users[i + 1].equals(password)) {
                    isAuthorized = true;
                    break;
                }
            }
        }

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String json = "{\"authorized\": " + isAuthorized + "}";
        response.getWriter().write(json);

        if (isAuthorized) {
            response.addCookie(new Cookie("login", login));
            response.addCookie(new Cookie("password", password));
        }

        String log = String.format("%s%n%s%n", java.time.LocalDateTime.now(), json);
        Files.write(Paths.get(getServletContext().getRealPath("/log.txt")), log.getBytes(), StandardOpenOption.APPEND);
    }
}

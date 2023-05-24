package com.example.lab7;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

@WebServlet("/checkReg")
public class CheckRegServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String login = request.getParameter("login");
        String password = request.getParameter("password");
        boolean exists = false;

        String filePath = getServletContext().getRealPath("/usersDb.txt");

        if (Files.exists(Paths.get(filePath))) {
            String[] users = Files.readAllLines(Paths.get(filePath)).toArray(String[]::new);
            for (int i = 0; i < users.length; i += 2) {
                if (users[i].equals(login)) {
                    exists = true;
                    break;
                }
            }
        }

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String json;
        if (exists) {
            json = "{\"exists\": true, \"message\": \"User already exists\"}";
        } else {
            json = "{\"exists\": false}";
            // Регистрация нового пользователя
            String userRecord = login + System.lineSeparator() + password + System.lineSeparator();
            Files.write(Paths.get(filePath), userRecord.getBytes(), StandardOpenOption.APPEND);
        }

        response.getWriter().write(json);
    }
}

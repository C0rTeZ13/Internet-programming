package com.example.lab7;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/logout")
public class LogoutServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException, IOException {
        response.setContentType("text/html");
        response.setCharacterEncoding("UTF-8");

        response.addCookie(new Cookie("login", ""));
        response.addCookie(new Cookie("password", ""));
        response.sendRedirect("index.jsp");
    }
}

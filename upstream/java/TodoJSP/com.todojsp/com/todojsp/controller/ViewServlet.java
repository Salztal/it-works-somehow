package com.todojsp.controller;

import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.todojsp.dto.TaskDto;
import com.todojsp.service.TaskService;

@WebServlet("/view")
public class ViewServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setAttribute("csrf", WebSupport.token(request));
        try {
            request.setAttribute("tasks", new TaskService().findAll());
        } catch (UnsupportedOperationException e) {
            request.setAttribute("error", e.getMessage());
        } catch (IllegalArgumentException e) {
            request.setAttribute("error", e.getMessage());
        } catch (SQLException e) {
            getServletContext().log("DB処理に失敗しました。", e);
            request.setAttribute("error", "DB処理に失敗しました。接続設定とDBの起動を確認してください。");
        }
        request.getRequestDispatcher("/WEB-INF/views/view.jsp").forward(request, response);
    }

}

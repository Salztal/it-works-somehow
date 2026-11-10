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

@WebServlet("/register")
public class RegisterServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setAttribute("csrf", WebSupport.token(request));
        request.getRequestDispatcher("/WEB-INF/views/register.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        request.setAttribute("csrf", WebSupport.token(request));
        if (!WebSupport.validToken(request)) { response.sendError(403, "入力画面からやり直してください。"); return; }
        try {

            TaskDto task = new TaskDto();
            task.setTitle(request.getParameter("title"));
            task.setDetail(request.getParameter("detail"));
            request.setAttribute("task", task);

            int count = new TaskService().registService(task);
            if (count != 1) { throw new IllegalArgumentException("対象のタスクがありません。"); }
            request.getSession().setAttribute("flash", "登録しました。");

            response.sendRedirect(request.getContextPath() + "/view");
            return;
        } catch (UnsupportedOperationException e) {
            request.setAttribute("error", e.getMessage());
        } catch (IllegalArgumentException e) {
            request.setAttribute("error", e.getMessage());
        } catch (SQLException e) {
            getServletContext().log("DB処理に失敗しました。", e);
            request.setAttribute("error", "DB処理に失敗しました。接続設定とDBの起動を確認してください。");
        }
        request.getRequestDispatcher("/WEB-INF/views/register.jsp").forward(request, response);
    }

}

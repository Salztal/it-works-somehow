package com.todojsp.service;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import com.todojsp.dao.TaskDao;
import com.todojsp.dto.TaskDto;
import com.todojsp.util.DbUtil;

/** 入力規則を確認し、1操作のDB接続の開始から終了までを担当する。 */
public class TaskService  {
    public int registService(TaskDto dto) throws SQLException {
        validateTask(dto);
        try (Connection con = DbUtil.getConnection(true)) {
            return new TaskDao(con).insertTask(dto);
        }
    }

    public List<TaskDto> findAll() throws SQLException {
        try (Connection con = DbUtil.getConnection(true)) { return new TaskDao(con).selectAll(); }
    }

    public TaskDto findById(int id) throws SQLException {
        validateId(id);
        try (Connection con = DbUtil.getConnection(true)) { return new TaskDao(con).selectById(id); }
    }

    public int updateService(TaskDto dto) throws SQLException {
        if (dto == null) { throw new IllegalArgumentException("タスクがありません。"); }
        validateId(dto.getId());
        validateTask(dto);
        try (Connection con = DbUtil.getConnection(true)) { return new TaskDao(con).updateTask(dto); }
    }

    public int deleteService(int id) throws SQLException {
        validateId(id);
        try (Connection con = DbUtil.getConnection(true)) { return new TaskDao(con).deleteTask(id); }
    }

    public int deleteAllService() throws SQLException {
        try (Connection con = DbUtil.getConnection(true)) { return new TaskDao(con).deleteAll(); }
    }

    private void validateId(int id) {
        if (id <= 0) { throw new IllegalArgumentException("IDは1以上の整数で入力してください。"); }
    }

    private void validateTask(TaskDto task) {
        if (task == null) { throw new IllegalArgumentException("タスクがありません。"); }
        String title = task.getTitle() == null ? "" : task.getTitle().strip();
        String detail = task.getDetail() == null ? "" : task.getDetail();
        if (title.isEmpty() || title.length() > 100) {
            throw new IllegalArgumentException("タイトルは1〜100文字で入力してください。");
        }
        if (detail.length() > 1000) { throw new IllegalArgumentException("詳細は1000文字以内で入力してください。"); }
        task.setTitle(title);
        task.setDetail(detail);
    }
}

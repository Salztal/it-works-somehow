package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import dto.TaskDto;

/** SQLを実行するクラス。Connectionの終了はServiceに任せる。 */
public class TaskDao {
    private final Connection con;
    public TaskDao(Connection con) { this.con = con; }

    public int insertTask(TaskDto task) throws SQLException {
        String sql = "INSERT INTO tasks (title, detail, completed) VALUES (?, ?, FALSE)";
        try (PreparedStatement stmt = con.prepareStatement(sql)) {
            // 1番目の?にタイトル、2番目の?に詳細を渡す。
            stmt.setString(1, task.getTitle());
            stmt.setString(2, task.getDetail());
            return stmt.executeUpdate();
        }
    }

    public List<TaskDto> selectAll() throws SQLException {
        String sql = "SELECT id, title, detail, completed FROM tasks ORDER BY id ASC";
        List<TaskDto> tasks = new ArrayList<>();
        try (PreparedStatement stmt = con.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) { tasks.add(toTask(rs)); }
        }
        return tasks;
    }

    /** 見つからない場合はnull。SQLの失敗は例外で区別する。 */
    public TaskDto selectById(int id) throws SQLException {
        String sql = "SELECT id, title, detail, completed FROM tasks WHERE id = ?";
        try (PreparedStatement stmt = con.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next() ? toTask(rs) : null;
            }
        }
    }

    public int updateTask(TaskDto task) throws SQLException {
        String sql = "UPDATE tasks SET title = ?, detail = ?, completed = ? WHERE id = ?";
        try (PreparedStatement stmt = con.prepareStatement(sql)) {
            stmt.setString(1, task.getTitle());
            stmt.setString(2, task.getDetail());
            stmt.setBoolean(3, task.getCompleted());
            stmt.setInt(4, task.getId());
            return stmt.executeUpdate();
        }
    }

    public int deleteTask(int id) throws SQLException {
        try (PreparedStatement stmt = con.prepareStatement("DELETE FROM tasks WHERE id = ?")) {
            stmt.setInt(1, id);
            return stmt.executeUpdate();
        }
    }

    /** 追加課題。呼び出し元で実行の確認を取ってから呼ぶ。 */
    public int deleteAll() throws SQLException {
        try (PreparedStatement stmt = con.prepareStatement("DELETE FROM tasks")) {
            return stmt.executeUpdate();
        }
    }

    private TaskDto toTask(ResultSet rs) throws SQLException {
        TaskDto task = new TaskDto();
        task.setId(rs.getInt("id"));
        task.setTitle(rs.getString("title"));
        task.setDetail(rs.getString("detail"));
        task.setCompleted(rs.getBoolean("completed"));
        return task;
    }
}

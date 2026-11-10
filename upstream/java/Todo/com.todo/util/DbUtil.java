package util;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/** 接続を作る。Connectionを共有せず、呼び出したServiceが閉じる。 */
public final class DbUtil {
    private DbUtil() { }

    public static Connection getConnection(boolean autoCommitFlg) throws SQLException {
        Properties settings = new Properties();
        try (InputStream in = DbUtil.class.getClassLoader().getResourceAsStream("db.properties")) {
            if (in == null) { throw new SQLException("db.propertiesがクラスパスにありません。"); }
            settings.load(in);
        } catch (IOException e) {
            throw new SQLException("DB設定を読み込めません。", e);
        }
        for (String key : new String[] {"db.url", "db.user", "db.password"}) {
            if (settings.getProperty(key) == null) { throw new SQLException("DB設定が不足しています: " + key); }
        }
        try { Class.forName("com.mysql.cj.jdbc.Driver"); }
        catch (ClassNotFoundException e) { throw new SQLException("Connector/Jが見つかりません。", e); }
        Connection con = DriverManager.getConnection(settings.getProperty("db.url"),
                settings.getProperty("db.user"), settings.getProperty("db.password"));
        try { con.setAutoCommit(autoCommitFlg); return con; }
        catch (SQLException e) { con.close(); throw e; }
    }
}

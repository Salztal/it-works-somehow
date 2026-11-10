package service.base;

import java.sql.Connection;
import java.sql.SQLException;
import util.DbUtil;

/** 共通の接続取得だけを提供する。接続はフィールドに保持しない。 */
public class BaseService {
    protected Connection openConnection() throws SQLException { return DbUtil.getConnection(true); }
}

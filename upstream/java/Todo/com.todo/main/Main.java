package main;

import java.sql.SQLException;
import java.util.List;
import java.util.Scanner;
import dto.TaskDto;
import service.TaskService;

public class Main {
    private static final TaskService service = new TaskService();

    public static void main(String[] args) {
        System.out.println("==============================");
        System.out.println("    TODOリスト管理システム");
        System.out.println("==============================");
        try (Scanner scanner = new Scanner(System.in)) {
            while (true) {
                System.out.println("1:登録  2:確認  3:更新  4:削除  5:全件削除（追加）  6:終了");
                System.out.print("使用する機能を選択してください：");
                if (!scanner.hasNextLine()) { return; }
                String number = scanner.nextLine();
                if (number.equals("6")) { System.out.println("終了します。"); return; }
                try {
                    switch (number) {
                    case "1": RegistTodo(scanner); break;
                    case "2": showTasks(service.findAll()); break;
                    case "3": updateTodo(scanner); break;
                    case "4": deleteTodo(scanner); break;
                    case "5": deleteAllTodo(scanner); break;
                    default: System.out.println("1〜6を選択してください。");
                    }
                } catch (UnsupportedOperationException e) {
                    System.out.println(e.getMessage());
                } catch (IllegalArgumentException e) {
                    System.out.println(e.getMessage());
                } catch (SQLException e) {
                    System.out.println("DB処理に失敗しました。設定とDBの起動を確認してください。");
                    e.printStackTrace(System.err);
                }
            }
        } catch (java.util.NoSuchElementException e) {
            System.out.println("入力を終了しました。");
        }
    }

    public static void RegistTodo(Scanner scanner) throws SQLException {
        TaskDto task = inputTask(scanner);
        int count = service.registService(task);
        System.out.println(count == 1 ? "タスクの登録が完了しました。" : "登録できませんでした。");
    }

    private static TaskDto inputTask(Scanner scanner) {
        TaskDto task = new TaskDto();
        task.setTitle(read(scanner, "タイトルを入力してください："));
        task.setDetail(read(scanner, "詳細を入力してください（省略可）："));
        return task;
    }

    private static void showTasks(List<TaskDto> tasks) {
        if (tasks.isEmpty()) { System.out.println("タスクはありません。"); }
        for (TaskDto task : tasks) { showTask(task); }
    }

    private static void showTask(TaskDto task) {
        System.out.println("ID=" + task.getId() + " | " + task.getTitle() + " | "
                + task.getDetail() + " | " + (task.getCompleted() ? "完了" : "未完了"));
    }

    private static int inputId(Scanner scanner) {
        while (true) {
            try {
                int id = Integer.parseInt(read(scanner, "IDを入力してください："));
                if (id > 0) { return id; }
            } catch (NumberFormatException e) { /* 次の行で再入力を案内する。 */ }
            System.out.println("IDは1以上の整数で入力してください。");
        }
    }

    private static void updateTodo(Scanner scanner) throws SQLException {
        int id = inputId(scanner);
        TaskDto current = service.findById(id);
        if (current == null) { System.out.println("対象のタスクがありません。"); return; }
        showTask(current);
        TaskDto task = inputTask(scanner);
        task.setId(id);
        String status;
        do { status = read(scanner, "完了状態（0:未完了、1:完了）："); }
        while (!status.equals("0") && !status.equals("1"));
        task.setCompleted(status.equals("1"));
        int count = service.updateService(task);
        System.out.println(count == 1 ? "更新しました。" : "対象のタスクがありません。");
    }

    private static void deleteTodo(Scanner scanner) throws SQLException {
        int id = inputId(scanner);
        TaskDto task = service.findById(id);
        if (task == null) { System.out.println("対象のタスクがありません。"); return; }
        showTask(task);
        if (!read(scanner, "削除しますか？ yで実行：").equals("y")) {
            System.out.println("取り消しました。"); return;
        }
        System.out.println(service.deleteService(id) == 1 ? "削除しました。" : "対象のタスクがありません。");
    }

    private static void deleteAllTodo(Scanner scanner) throws SQLException {
        System.out.println("現在のタスク数：" + service.findAll().size());
        if (!read(scanner, "全件削除する場合はDELETE ALLを入力：").equals("DELETE ALL")) {
            System.out.println("取り消しました。"); return;
        }
        System.out.println(service.deleteAllService() + "件を削除しました。");
    }

    private static String read(Scanner scanner, String prompt) {
        System.out.print(prompt);
        return scanner.nextLine();
    }
}

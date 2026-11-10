package dto;

/** 入力された値と、DBから取得した1件分の値を運ぶクラス。 */
public class TaskDto {
    private int id;
    private String title;
    private String detail;
    private boolean completed;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }
    public boolean getCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
}

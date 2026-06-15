package com.proconnect.backend.dto;

public class AdminUserActionRequest {

    private String note;
    private Integer suspendDays;

    public AdminUserActionRequest() {
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Integer getSuspendDays() {
        return suspendDays;
    }

    public void setSuspendDays(Integer suspendDays) {
        this.suspendDays = suspendDays;
    }
}

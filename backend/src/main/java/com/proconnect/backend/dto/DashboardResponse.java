package com.proconnect.backend.dto;

public class DashboardResponse {

    private long projectsPosted;
    private long applicationsSent;
    private long applicationsReceived;

    public DashboardResponse() {
    }

    public DashboardResponse(long projectsPosted, long applicationsSent, long applicationsReceived) {
        this.projectsPosted = projectsPosted;
        this.applicationsSent = applicationsSent;
        this.applicationsReceived = applicationsReceived;
    }

    public long getProjectsPosted() {
        return projectsPosted;
    }

    public void setProjectsPosted(long projectsPosted) {
        this.projectsPosted = projectsPosted;
    }

    public long getApplicationsSent() {
        return applicationsSent;
    }

    public void setApplicationsSent(long applicationsSent) {
        this.applicationsSent = applicationsSent;
    }

    public long getApplicationsReceived() {
        return applicationsReceived;
    }

    public void setApplicationsReceived(long applicationsReceived) {
        this.applicationsReceived = applicationsReceived;
    }
}
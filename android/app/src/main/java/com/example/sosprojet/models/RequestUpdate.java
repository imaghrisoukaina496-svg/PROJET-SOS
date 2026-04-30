package com.example.sosprojet.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class RequestUpdate implements Serializable {

    @SerializedName("id")
    private int id;

    @SerializedName("emergency_request_id")
    private int requestId;

    @SerializedName("updated_by")
    private String updatedBy;

    @SerializedName("new_status")
    private String newStatus;

    @SerializedName("update_message")
    private String note;

    @SerializedName("created_at")
    private String createdAt;

    public RequestUpdate() {}

    // ── Getters / Setters ─────────────────────────────────────────
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getRequestId() { return requestId; }
    public void setRequestId(int requestId) { this.requestId = requestId; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    // ── Helpers UI ────────────────────────────────────────────────
    public String getTimelineDotColor() {
        if (newStatus == null) return "#6B7280";
        switch (newStatus) {
            case "ENVOYEE":         return "#DC2626";
            case "PRISE_EN_CHARGE": return "#F59E0B";
            case "EN_INTERVENTION": return "#10B981";
            case "CLOTUREE":        return "#7C3AED";
            default:                return "#6B7280";
        }
    }

    public String getStatusLabel() {
        if (newStatus == null) return "Mise à jour";
        switch (newStatus) {
            case "ENVOYEE":         return "Alerte envoyee";
            case "PRISE_EN_CHARGE": return "Prise en charge";
            case "EN_INTERVENTION": return "En intervention";
            case "CLOTUREE":        return "Cloturee";
            default:                return "Mise à jour";
        }
    }
}
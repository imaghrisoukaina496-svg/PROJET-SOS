package com.example.sosprojet.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class EmergencyRequest implements Serializable {

    @SerializedName("id")
    private int id;

    @SerializedName("emergency_type")
    private String emergencyType;

    @SerializedName("emergency_type_id")
    private int emergencyTypeId;

    @SerializedName("status")
    private String status; // "ENVOYEE" | "PRISE_EN_CHARGE" | "EN_INTERVENTION" | "CLOTUREE"

    @SerializedName("latitude")
    private double latitude;

    @SerializedName("longitude")
    private double longitude;

    @SerializedName("message")
    private String message;

    @SerializedName("assigned_agent")
    private String assignedAgent;

    @SerializedName("user_name")
    private String userName;

    @SerializedName("created_at")
    private String createdAt;

    @SerializedName("updated_at")
    private String updatedAt;

    @SerializedName("location_label")
    private String locationLabel;

    // ── Constructeurs ─────────────────────────────────────────────
    public EmergencyRequest() {}

    public EmergencyRequest(int emergencyTypeId, double latitude,
                            double longitude, String message) {
        this.emergencyTypeId = emergencyTypeId;
        this.latitude        = latitude;
        this.longitude       = longitude;
        this.message         = message;
    }

    // ── Getters / Setters ─────────────────────────────────────────
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getEmergencyType() { return emergencyType; }
    public void setEmergencyType(String emergencyType) { this.emergencyType = emergencyType; }

    public int getEmergencyTypeId() { return emergencyTypeId; }
    public void setEmergencyTypeId(int emergencyTypeId) { this.emergencyTypeId = emergencyTypeId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getAssignedAgent() { return assignedAgent; }
    public void setAssignedAgent(String assignedAgent) { this.assignedAgent = assignedAgent; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public String getLocationLabel() { return locationLabel; }
    public void setLocationLabel(String locationLabel) { this.locationLabel = locationLabel; }

    // ── Helpers UI ────────────────────────────────────────────────
    public String getStatusLabel() {
        if (status == null) return "Envoyee";
        switch (status) {
            case "ENVOYEE":          return "Envoyee";
            case "PRISE_EN_CHARGE":  return "En charge";
            case "EN_INTERVENTION":  return "Intervention";
            case "CLOTUREE":         return "Cloturee";
            default:                 return status;
        }
    }

    public String getStatusColor() {
        if (status == null) return "#DC2626";
        switch (status) {
            case "ENVOYEE":          return "#DC2626";
            case "PRISE_EN_CHARGE":  return "#D97706";
            case "EN_INTERVENTION":  return "#059669";
            case "CLOTUREE":         return "#7C3AED";
            default:                 return "#6B7280";
        }
    }

    public int getStatusBadgeRes() {
        if (status == null) return com.example.sosprojet.R.drawable.bg_badge_sent;
        switch (status) {
            case "PRISE_EN_CHARGE":  return com.example.sosprojet.R.drawable.bg_badge_taken;
            case "EN_INTERVENTION":  return com.example.sosprojet.R.drawable.bg_badge_inter;
            case "CLOTUREE":         return com.example.sosprojet.R.drawable.bg_badge_closed;
            default:                 return com.example.sosprojet.R.drawable.bg_badge_sent;
        }
    }

    public boolean isEditable() {
        return !"CLOTUREE".equals(status);
    }
}
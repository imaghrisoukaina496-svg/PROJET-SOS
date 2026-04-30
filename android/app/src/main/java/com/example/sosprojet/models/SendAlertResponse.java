package com.example.sosprojet.models;

import com.google.gson.annotations.SerializedName;

/**
 * Réponse de POST /api/emergency-requests/
 * {
 *   "message": "Alerte SOS créée avec succès",
 *   "emergency_request_id": 12
 * }
 */
public class SendAlertResponse {

    @SerializedName("message")
    private String message;

    @SerializedName("emergency_request_id")
    private int emergencyRequestId;

    public String getMessage()          { return message; }
    public int getEmergencyRequestId()  { return emergencyRequestId; }
}
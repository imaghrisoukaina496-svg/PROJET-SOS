package com.example.sosprojet.models;

import com.google.gson.annotations.SerializedName;

/**
 * Corps de la requête pour créer une alerte SOS
 * POST /api/emergency-requests/
 * Champs requis : emergency_type_id, latitude, longitude
 * Champ optionnel : message
 */
public class SendAlertRequest {

    @SerializedName("emergency_type_id")
    private int emergencyTypeId;

    @SerializedName("latitude")
    private double latitude;

    @SerializedName("longitude")
    private double longitude;

    @SerializedName("message")
    private String message;

    public SendAlertRequest(int emergencyTypeId, double latitude,
                            double longitude, String message) {
        this.emergencyTypeId = emergencyTypeId;
        this.latitude        = latitude;
        this.longitude       = longitude;
        this.message         = message;
    }

    public int getEmergencyTypeId()    { return emergencyTypeId; }
    public double getLatitude()         { return latitude; }
    public double getLongitude()        { return longitude; }
    public String getMessage()          { return message; }
}
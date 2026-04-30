package com.example.sosprojet.models;

import com.google.gson.annotations.SerializedName;

public class AddUpdateRequest {
    @SerializedName("message")
    private String message;

    public AddUpdateRequest(String message) {
        this.message = message;
    }

    public String getMessage() { return message; }
}
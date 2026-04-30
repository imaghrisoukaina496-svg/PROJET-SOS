package com.example.sosprojet.models;

import com.google.gson.annotations.SerializedName;

public class LoginResponse {

    @SerializedName("message")
    private String message;

    @SerializedName("token")
    private String token;

    @SerializedName("user")
    private User user;

    public String getMessage() { return message; }
    public String getToken()   { return token; }

    public String getUserName() {
        return user != null ? user.fullName : "";
    }

    public String getUserEmail() {
        return user != null ? user.email : "";
    }

    public int getUserId() {
        return user != null ? user.id : -1;
    }

    public String getUserRole() {
        return user != null ? user.role : "";
    }

    // ── Classe interne User ───────────────────────────────────────
    public static class User {

        @SerializedName("id")
        public int id;

        @SerializedName("full_name")
        public String fullName;

        @SerializedName("email")
        public String email;

        @SerializedName("role")
        public String role;
    }
}
package com.example.sosprojet.api;

import com.example.sosprojet.models.AddUpdateRequest;
import com.example.sosprojet.models.EmergencyRequest;
import com.example.sosprojet.models.GenericResponse;
import com.example.sosprojet.models.LoginRequest;
import com.example.sosprojet.models.LoginResponse;
import com.example.sosprojet.models.SendAlertRequest;
import com.example.sosprojet.models.SendAlertResponse;
import com.example.sosprojet.models.StatusUpdateRequest;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.PATCH;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface ApiService {

    // ── Auth ──────────────────────────────────────────────────────
    @POST("api/auth/login")
    Call<LoginResponse> login(@Body LoginRequest request);

    // ── Usager : Envoyer alerte ───────────────────────────────────
    @POST("api/emergencies")
    Call<SendAlertResponse> sendAlert(@Body SendAlertRequest request);

    // ── Usager : Mes alertes ──────────────────────────────────────
    @GET("api/emergencies/mine")
    Call<List<EmergencyRequest>> getMyAlerts();

    // ── Usager + Agent : Détail alerte ────────────────────────────
    @GET("api/emergencies/{id}")
    Call<EmergencyRequest> getAlertById(@Path("id") int id);

    // ── Agent : Toutes les alertes ────────────────────────────────
    @GET("api/emergencies")
    Call<List<EmergencyRequest>> getAllAlerts();

    // ── Agent : Changer statut ────────────────────────────────────
    @PATCH("api/emergencies/{id}/status")
    Call<GenericResponse> updateStatus(@Path("id") int id,
                                       @Body StatusUpdateRequest request);

    // ── Agent : Ajouter mise à jour ───────────────────────────────
    @POST("api/emergencies/{id}/updates")
    Call<GenericResponse> addUpdate(@Path("id") int id,
                                    @Body AddUpdateRequest request);
}
package com.example.sosprojet.activities;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.app.AppCompatDelegate;
import com.example.sosprojet.R;
import com.example.sosprojet.api.RetrofitClient;
import com.example.sosprojet.models.LoginRequest;
import com.example.sosprojet.models.LoginResponse;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private EditText   etEmail, etPassword;
    private Button     btnLogin;
    private ProgressBar progressBar;
    private TextView   tvError;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Appliquer le thème sauvegardé
        SharedPreferences prefs = getSharedPreferences("sos_prefs", MODE_PRIVATE);
        boolean isDark = prefs.getBoolean("dark_mode", false);
        AppCompatDelegate.setDefaultNightMode(
                isDark ? AppCompatDelegate.MODE_NIGHT_YES
                        : AppCompatDelegate.MODE_NIGHT_NO);

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        // Initialiser Retrofit avec le contexte
        RetrofitClient.init(this);

        bindViews();
        setupLoginButton();
    }

    // ── Binding ───────────────────────────────────────────────────
    private void bindViews() {
        etEmail     = findViewById(R.id.et_email);
        etPassword  = findViewById(R.id.et_password);
        btnLogin    = findViewById(R.id.btn_login);
        progressBar = findViewById(R.id.progress_login);
        tvError     = findViewById(R.id.tv_error);
    }

    // ── Bouton login ──────────────────────────────────────────────
    private void setupLoginButton() {
        btnLogin.setOnClickListener(v -> {
            String email    = etEmail.getText().toString().trim();
            String password = etPassword.getText().toString().trim();

            // Validation
            if (email.isEmpty()) {
                etEmail.setError("Email requis");
                etEmail.requestFocus();
                return;
            }
            if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                etEmail.setError("Email invalide");
                etEmail.requestFocus();
                return;
            }
            if (password.isEmpty()) {
                etPassword.setError("Mot de passe requis");
                etPassword.requestFocus();
                return;
            }
            if (password.length() < 6) {
                etPassword.setError("Minimum 6 caracteres");
                etPassword.requestFocus();
                return;
            }

            doLogin(email, password);
        });
    }

    // ── Appel API login ───────────────────────────────────────────
    private void doLogin(String email, String password) {
        setLoading(true);
        tvError.setVisibility(View.GONE);

        RetrofitClient.getService()
                .login(new LoginRequest(email, password))
                .enqueue(new Callback<LoginResponse>() {

                    @Override
                    public void onResponse(Call<LoginResponse> call,
                                           Response<LoginResponse> response) {
                        setLoading(false);

                        if (response.isSuccessful() && response.body() != null) {
                            saveSession(response.body());
                            goToMain();
                        } else {
                            showError("Email ou mot de passe incorrect");
                        }
                    }

                    @Override
                    public void onFailure(Call<LoginResponse> call, Throwable t) {
                        setLoading(false);
                        showError("Erreur reseau. Verifiez votre connexion.");
                    }
                });
    }

    // ── Sauvegarder session JWT ───────────────────────────────────
    private void saveSession(LoginResponse data) {
        getSharedPreferences("sos_prefs", MODE_PRIVATE)
                .edit()
                .putString("jwt_token",  data.getToken())
                .putString("user_name",  data.getUserName())
                .putString("user_email", data.getUserEmail())
                .putInt("user_id",       data.getUserId())
                .apply();
    }

    // ── Navigation ────────────────────────────────────────────────
    private void goToMain() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }

    // ── Helpers UI ────────────────────────────────────────────────
    private void setLoading(boolean loading) {
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        btnLogin.setEnabled(!loading);
        btnLogin.setText(loading ? "Connexion..." : "Se connecter");
    }

    private void showError(String message) {
        tvError.setText(message);
        tvError.setVisibility(View.VISIBLE);
    }
}
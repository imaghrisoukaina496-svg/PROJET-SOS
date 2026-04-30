package com.example.sosprojet.activities;

import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.sosprojet.R;
import com.example.sosprojet.adapters.AlertAdapter;
import com.example.sosprojet.api.RetrofitClient;
import com.example.sosprojet.models.EmergencyRequest;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HomeFragment extends Fragment {

    private View         sosRing;
    private View         btnSos;
    private LinearLayout cardMedical, cardSecurity, cardFire, cardOther;
    private RecyclerView rvRecentAlerts;
    private AlertAdapter adapter;
    private AnimatorSet  pulseAnimator;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_home, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        bindViews(view);
        loadUserInfo(view);
        setupSOSButton();
        setupTypeCards();
        setupRecentAlerts();
        startPulseAnimation();
    }

    private void bindViews(View view) {
        sosRing        = view.findViewById(R.id.iv_sos_ring);
        btnSos         = view.findViewById(R.id.btn_sos);
        cardMedical    = view.findViewById(R.id.card_medical);
        cardSecurity   = view.findViewById(R.id.card_security);
        cardFire       = view.findViewById(R.id.card_fire);
        cardOther      = view.findViewById(R.id.card_other);
        rvRecentAlerts = view.findViewById(R.id.rv_recent_alerts);
    }

    // ── Charger infos utilisateur depuis SharedPreferences ────────
    private void loadUserInfo(View view) {
        SharedPreferences prefs = requireContext()
                .getSharedPreferences("sos_prefs", requireContext().MODE_PRIVATE);

        String userName = prefs.getString("user_name", "Utilisateur");

        // Nom dans le header
        TextView tvUsername = view.findViewById(R.id.tv_username);
        if (tvUsername != null) tvUsername.setText(userName);

        // Avatar (initiales)
        TextView tvAvatar = view.findViewById(R.id.tv_user_avatar);
        if (tvAvatar != null) {
            String[] parts = userName.split(" ");
            StringBuilder ini = new StringBuilder();
            for (String p : parts) if (!p.isEmpty()) ini.append(p.charAt(0));
            tvAvatar.setText(ini.toString().toUpperCase());
        }
    }

    // ── Bouton SOS ───────────────────────────────────────────────
    private void setupSOSButton() {
        btnSos.setOnClickListener(v -> {
            animateSOSPress(v);
            showConfirmDialog();
        });
    }

    private void animateSOSPress(View v) {
        ObjectAnimator scaleX = ObjectAnimator.ofFloat(v, "scaleX", 1f, 0.88f, 1f);
        ObjectAnimator scaleY = ObjectAnimator.ofFloat(v, "scaleY", 1f, 0.88f, 1f);
        AnimatorSet set = new AnimatorSet();
        set.playTogether(scaleX, scaleY);
        set.setDuration(200);
        set.start();
    }

    private void showConfirmDialog() {
        new android.app.AlertDialog.Builder(requireContext())
                .setTitle("Confirmer l'alerte SOS")
                .setMessage("Voulez-vous envoyer une alerte d'urgence ?\nVotre position GPS sera transmise.")
                .setPositiveButton("Envoyer", (dialog, which) -> openSOSForm(0))
                .setNegativeButton("Annuler", null)
                .create()
                .show();
    }

    // ── Types d'urgence ──────────────────────────────────────────
    private void setupTypeCards() {
        cardMedical.setOnClickListener(v  -> openSOSForm(1));
        cardSecurity.setOnClickListener(v -> openSOSForm(2));
        cardFire.setOnClickListener(v     -> openSOSForm(3));
        cardOther.setOnClickListener(v    -> openSOSForm(4));
    }

    private void openSOSForm(int typeId) {
        if (getActivity() instanceof MainActivity) {
            ((MainActivity) getActivity()).openSOSForm(typeId);
        }
    }

    // ── Alertes récentes depuis l'API ─────────────────────────────
    private void setupRecentAlerts() {
        rvRecentAlerts.setLayoutManager(new LinearLayoutManager(requireContext()));
        rvRecentAlerts.setNestedScrollingEnabled(false);

        adapter = new AlertAdapter(new ArrayList<>(), request -> {
            if (getActivity() instanceof MainActivity) {
                ((MainActivity) getActivity()).openSuivi(request.getId());
            }
        });
        rvRecentAlerts.setAdapter(adapter);
        loadRecentAlerts();
    }

    private void loadRecentAlerts() {
        RetrofitClient.getService().getMyAlerts()
                .enqueue(new Callback<List<EmergencyRequest>>() {
                    @Override
                    public void onResponse(Call<List<EmergencyRequest>> call,
                                           Response<List<EmergencyRequest>> response) {
                        if (!isAdded()) return;
                        if (response.isSuccessful() && response.body() != null) {
                            List<EmergencyRequest> all = response.body();
                            List<EmergencyRequest> recent = all.size() > 3
                                    ? all.subList(0, 3) : all;
                            adapter.updateAlerts(new ArrayList<>(recent));
                        }
                    }

                    @Override
                    public void onFailure(Call<List<EmergencyRequest>> call, Throwable t) {}
                });
    }

    @Override
    public void onResume() {
        super.onResume();
        loadRecentAlerts();
    }

    // ── Animation pulsation ──────────────────────────────────────
    private void startPulseAnimation() {
        if (sosRing == null) return;

        ObjectAnimator scaleX = ObjectAnimator.ofFloat(sosRing, "scaleX", 1f, 1.12f, 1f);
        ObjectAnimator scaleY = ObjectAnimator.ofFloat(sosRing, "scaleY", 1f, 1.12f, 1f);
        ObjectAnimator alpha  = ObjectAnimator.ofFloat(sosRing, "alpha", 0.6f, 1f, 0.6f);

        scaleX.setRepeatCount(ObjectAnimator.INFINITE);
        scaleX.setRepeatMode(ObjectAnimator.RESTART);
        scaleY.setRepeatCount(ObjectAnimator.INFINITE);
        scaleY.setRepeatMode(ObjectAnimator.RESTART);
        alpha.setRepeatCount(ObjectAnimator.INFINITE);
        alpha.setRepeatMode(ObjectAnimator.RESTART);

        pulseAnimator = new AnimatorSet();
        pulseAnimator.playTogether(scaleX, scaleY, alpha);
        pulseAnimator.setDuration(1800);
        pulseAnimator.setInterpolator(new AccelerateDecelerateInterpolator());
        pulseAnimator.start();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        if (pulseAnimator != null) pulseAnimator.cancel();
    }
}
package com.example.sosprojet.activities;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import com.example.sosprojet.R;
import com.example.sosprojet.api.RetrofitClient;
import com.example.sosprojet.models.EmergencyRequest;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SuiviFragment extends Fragment {

    private static final String ARG_REQUEST_ID = "request_id";
    private static final long   POLL_INTERVAL  = 30_000L;

    private TextView tvAlertType, tvAlertLocation, tvStatusBadge, tvAlertTime;
    private View     cardAgent;
    private TextView tvAgentName, tvAgentRole, tvAgentAvatar;
    private View barSent, barTaken, barInter, barClosed;

    private final Handler pollHandler = new Handler(Looper.getMainLooper());
    private int requestId;

    public static SuiviFragment newInstance(int requestId) {
        SuiviFragment f = new SuiviFragment();
        Bundle args = new Bundle();
        args.putInt(ARG_REQUEST_ID, requestId);
        f.setArguments(args);
        return f;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_suivi, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        requestId = getArguments() != null ? getArguments().getInt(ARG_REQUEST_ID, -1) : -1;
        bindViews(view);
        setupButtons(view);
        loadData();
        startPolling();
    }

    private void bindViews(View view) {
        tvAlertType     = view.findViewById(R.id.tv_alert_type);
        tvAlertLocation = view.findViewById(R.id.tv_alert_location);
        tvStatusBadge   = view.findViewById(R.id.tv_status_badge);
        tvAlertTime     = view.findViewById(R.id.tv_alert_time);
        cardAgent       = view.findViewById(R.id.card_agent);
        tvAgentName     = view.findViewById(R.id.tv_agent_name);
        tvAgentRole     = view.findViewById(R.id.tv_agent_role);
        tvAgentAvatar   = view.findViewById(R.id.tv_agent_avatar);
        barSent         = view.findViewById(R.id.bar_sent);
        barTaken        = view.findViewById(R.id.bar_taken);
        barInter        = view.findViewById(R.id.bar_inter);
        barClosed       = view.findViewById(R.id.bar_closed);
    }

    private void setupButtons(View view) {
        ImageButton btnBack = view.findViewById(R.id.btn_back);
        btnBack.setOnClickListener(v -> {
            requireActivity().getSupportFragmentManager().popBackStack();
            if (getActivity() instanceof MainActivity)
                ((MainActivity) getActivity()).showBottomNav();
        });
        view.findViewById(R.id.btn_refresh).setOnClickListener(v -> loadData());
    }

    private void loadData() {
        if (requestId <= 0) return;
        RetrofitClient.getService().getAlertById(requestId)
                .enqueue(new Callback<EmergencyRequest>() {
                    @Override
                    public void onResponse(Call<EmergencyRequest> call,
                                           Response<EmergencyRequest> response) {
                        if (!isAdded()) return;
                        if (response.isSuccessful() && response.body() != null) {
                            updateUI(response.body());
                        }
                    }
                    @Override
                    public void onFailure(Call<EmergencyRequest> call, Throwable t) {
                        if (isAdded())
                            Toast.makeText(requireContext(), "Erreur réseau", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void updateUI(EmergencyRequest req) {
        tvAlertType.setText(req.getEmergencyType() != null ? req.getEmergencyType() : "Urgence");

        if (req.getLatitude() != 0 && req.getLongitude() != 0) {
            tvAlertLocation.setText(String.format(java.util.Locale.FRENCH,
                    "%.4f N, %.4f O", req.getLatitude(), Math.abs(req.getLongitude())));
        }

        tvAlertTime.setText("Envoyee : " + (req.getCreatedAt() != null ? req.getCreatedAt() : "—"));

        applyStatusBadge(req.getStatus());
        applyProgressBars(req.getStatus());

        if (req.getAssignedAgent() != null && !req.getAssignedAgent().isEmpty()) {
            cardAgent.setVisibility(View.VISIBLE);
            tvAgentName.setText("Agent " + req.getAssignedAgent());
            tvAgentRole.setText("Agent de securite");
            String[] parts = req.getAssignedAgent().split(" ");
            StringBuilder ini = new StringBuilder();
            for (String p : parts) if (!p.isEmpty()) ini.append(p.charAt(0));
            tvAgentAvatar.setText(ini.toString().toUpperCase());
        } else {
            cardAgent.setVisibility(View.GONE);
        }
    }

    private void applyStatusBadge(String status) {
        if (status == null) status = "ENVOYEE";
        int textColor, bgRes;
        String label;
        switch (status) {
            case "PRISE_EN_CHARGE":
                textColor = ContextCompat.getColor(requireContext(), R.color.status_taken);
                bgRes = R.drawable.bg_badge_taken;
                label = "En charge";
                break;
            case "EN_INTERVENTION":
                textColor = ContextCompat.getColor(requireContext(), R.color.status_inter);
                bgRes = R.drawable.bg_badge_inter;
                label = "Intervention";
                break;
            case "CLOTUREE":
                textColor = ContextCompat.getColor(requireContext(), R.color.status_closed);
                bgRes = R.drawable.bg_badge_closed;
                label = "Cloturee";
                break;
            default:
                textColor = ContextCompat.getColor(requireContext(), R.color.status_sent);
                bgRes = R.drawable.bg_badge_sent;
                label = "Envoyee";
                break;
        }
        tvStatusBadge.setText(label);
        tvStatusBadge.setTextColor(textColor);
        tvStatusBadge.setBackgroundResource(bgRes);
    }

    private void applyProgressBars(String status) {
        if (status == null) status = "ENVOYEE";

        setAlpha(barSent,   0.35f);
        setAlpha(barTaken,  0.35f);
        setAlpha(barInter,  0.35f);
        setAlpha(barClosed, 0.35f);

        if (status.equals("ENVOYEE") || status.equals("PRISE_EN_CHARGE")
                || status.equals("EN_INTERVENTION") || status.equals("CLOTUREE")) {
            setAlpha(barSent, 1f);
        }
        if (status.equals("PRISE_EN_CHARGE") || status.equals("EN_INTERVENTION")
                || status.equals("CLOTUREE")) {
            setAlpha(barTaken, 1f);
        }
        if (status.equals("EN_INTERVENTION") || status.equals("CLOTUREE")) {
            setAlpha(barInter, 1f);
        }
        if (status.equals("CLOTUREE")) {
            setAlpha(barClosed, 1f);
        }
    }

    private void setAlpha(View v, float alpha) {
        if (v != null) v.setAlpha(alpha);
    }

    private void startPolling() {
        pollHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                if (isAdded()) {
                    loadData();
                    pollHandler.postDelayed(this, POLL_INTERVAL);
                }
            }
        }, POLL_INTERVAL);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        pollHandler.removeCallbacksAndMessages(null);
    }
}
package com.example.sosprojet.activities;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.Switch;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.example.sosprojet.R;

public class ProfileFragment extends Fragment {

    private TextView tvName, tvEmail, tvAvatar;
    private Switch switchTheme;
    private Button btnLogout;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_profile, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        tvName      = view.findViewById(R.id.tv_profile_name);
        tvEmail     = view.findViewById(R.id.tv_profile_email);
        tvAvatar    = view.findViewById(R.id.tv_profile_avatar);
        switchTheme = view.findViewById(R.id.switch_theme);
        btnLogout   = view.findViewById(R.id.btn_logout);

        loadUserInfo();
        setupThemeSwitch();
        setupLogout();
    }

    private void loadUserInfo() {
        SharedPreferences prefs = requireContext()
                .getSharedPreferences("sos_prefs", requireContext().MODE_PRIVATE);

        String name  = prefs.getString("user_name", "Utilisateur");
        String email = prefs.getString("user_email", "");
        boolean dark = prefs.getBoolean("dark_mode", true);

        tvName.setText(name);
        tvEmail.setText(email);

        // Initiales avatar
        String[] parts = name.split(" ");
        StringBuilder initials = new StringBuilder();
        for (String p : parts) if (!p.isEmpty()) initials.append(p.charAt(0));
        tvAvatar.setText(initials.toString().toUpperCase());

        // État du switch thème
        switchTheme.setChecked(dark);
        updateThemeLabel(dark);
    }

    private void setupThemeSwitch() {
        TextView tvThemeLabel = requireView().findViewById(R.id.tv_theme_label);

        switchTheme.setOnCheckedChangeListener((btn, isChecked) -> {
            tvThemeLabel.setText(isChecked ? "Mode sombre" : "Mode clair");
            if (getActivity() instanceof MainActivity) {
                ((MainActivity) getActivity()).toggleTheme(isChecked);
            }
        });
    }

    private void updateThemeLabel(boolean isDark) {
        TextView tvThemeLabel = requireView().findViewById(R.id.tv_theme_label);
        if (tvThemeLabel != null)
            tvThemeLabel.setText(isDark ? "Mode sombre" : "Mode clair");
    }

    private void setupLogout() {
        btnLogout.setOnClickListener(v -> {
            // Effacer les données de session
            requireContext().getSharedPreferences("sos_prefs", requireContext().MODE_PRIVATE)
                    .edit()
                    .remove("jwt_token")
                    .remove("user_name")
                    .remove("user_email")
                    .remove("user_id")
                    .apply();

            // Retourner au login
            Intent intent = new Intent(requireContext(), LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
        });
    }
}
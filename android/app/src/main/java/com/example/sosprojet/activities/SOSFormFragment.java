package com.example.sosprojet.activities;

import android.Manifest;
import android.animation.ObjectAnimator;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Bundle;
import android.os.Looper;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.fragment.app.Fragment;
import com.example.sosprojet.R;
import com.example.sosprojet.api.RetrofitClient;
import com.example.sosprojet.models.SendAlertRequest;
import com.example.sosprojet.models.SendAlertResponse;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SOSFormFragment extends Fragment {

    private static final String ARG_TYPE_ID     = "type_id";
    private static final int    REQUEST_LOCATION = 1001;

    private LinearLayout typeMedical, typeSecurity, typeFire, typeOther;
    private TextView     tvGpsLocation;
    private View         gpsDot;
    private ImageView    ivGpsRefresh;
    private ProgressBar  progressGps;
    private EditText     etMessage;
    private Button       btnSendSos;

    private int    selectedTypeId = -1;
    private double currentLat     = 0.0;
    private double currentLng     = 0.0;

    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;

    public static SOSFormFragment newInstance(int preselectedTypeId) {
        SOSFormFragment f = new SOSFormFragment();
        Bundle args = new Bundle();
        args.putInt(ARG_TYPE_ID, preselectedTypeId);
        f.setArguments(args);
        return f;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_sos_form, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        bindViews(view);
        setupBackButton(view);
        setupTypeCards();
        setupSendButton();

        int preselected = getArguments() != null
                ? getArguments().getInt(ARG_TYPE_ID, -1) : -1;
        if (preselected > 0) selectType(preselected);

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(requireActivity());
        fetchGPS();
    }

    // ── Binding ───────────────────────────────────────────────────
    private void bindViews(View view) {
        typeMedical   = view.findViewById(R.id.type_medical);
        typeSecurity  = view.findViewById(R.id.type_security);
        typeFire      = view.findViewById(R.id.type_fire);
        typeOther     = view.findViewById(R.id.type_other);
        tvGpsLocation = view.findViewById(R.id.tv_gps_location);
        gpsDot        = view.findViewById(R.id.gps_dot);
        ivGpsRefresh  = view.findViewById(R.id.iv_gps_refresh);
        progressGps   = view.findViewById(R.id.progress_gps);
        etMessage     = view.findViewById(R.id.et_message);
        btnSendSos    = view.findViewById(R.id.btn_send_sos);
    }

    // ── Bouton retour ─────────────────────────────────────────────
    private void setupBackButton(View view) {
        ImageButton btnBack = view.findViewById(R.id.btn_back);
        btnBack.setOnClickListener(v -> {
            requireActivity().getSupportFragmentManager().popBackStack();
            if (getActivity() instanceof MainActivity)
                ((MainActivity) getActivity()).showBottomNav();
        });
    }

    // ── Types d'urgence ───────────────────────────────────────────
    private void setupTypeCards() {
        typeMedical.setOnClickListener(v  -> selectType(1));
        typeSecurity.setOnClickListener(v -> selectType(2));
        typeFire.setOnClickListener(v     -> selectType(3));
        typeOther.setOnClickListener(v    -> selectType(4));
    }

    private void selectType(int typeId) {
        selectedTypeId = typeId;
        typeMedical.setSelected(false);
        typeSecurity.setSelected(false);
        typeFire.setSelected(false);
        typeOther.setSelected(false);

        switch (typeId) {
            case 1: typeMedical.setSelected(true);  break;
            case 2: typeSecurity.setSelected(true); break;
            case 3: typeFire.setSelected(true);     break;
            case 4: typeOther.setSelected(true);    break;
        }
        requireView().performHapticFeedback(android.view.HapticFeedbackConstants.VIRTUAL_KEY);
    }

    // ── GPS ───────────────────────────────────────────────────────
    private void fetchGPS() {
        showGpsLoading(true);

        if (ActivityCompat.checkSelfPermission(requireContext(),
                Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                    REQUEST_LOCATION);
            return;
        }

        // Essayer getLastLocation d'abord
        fusedLocationClient.getLastLocation()
                .addOnSuccessListener(location -> {
                    if (location != null) {
                        showGpsLoading(false);
                        onLocationReceived(location);
                    } else {
                        // Si null → demander position en temps réel
                        requestCurrentLocation();
                    }
                })
                .addOnFailureListener(e -> {
                    showGpsLoading(false);
                    tvGpsLocation.setText("Erreur GPS");
                });
    }

    // ── Demander position en temps réel ──────────────────────────
    private void requestCurrentLocation() {
        if (ActivityCompat.checkSelfPermission(requireContext(),
                Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) return;

        LocationRequest locationRequest = new LocationRequest.Builder(
                Priority.PRIORITY_HIGH_ACCURACY, 1000)
                .setMaxUpdates(1)
                .build();

        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(@NonNull LocationResult result) {
                if (!isAdded()) return;
                showGpsLoading(false);
                Location location = result.getLastLocation();
                if (location != null) {
                    onLocationReceived(location);
                } else {
                    tvGpsLocation.setText("Position indisponible");
                }
                // Arrêter les mises à jour
                fusedLocationClient.removeLocationUpdates(this);
            }
        };

        fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
        );
    }

    private void onLocationReceived(Location location) {
        currentLat = location.getLatitude();
        currentLng = location.getLongitude();
        String label = String.format(java.util.Locale.FRENCH,
                "%.4f° N, %.4f° O", currentLat, Math.abs(currentLng));
        tvGpsLocation.setText(label);
        animateGpsDot();
    }

    private void showGpsLoading(boolean show) {
        if (progressGps != null)
            progressGps.setVisibility(show ? View.VISIBLE : View.GONE);
    }

    private void animateGpsDot() {
        ObjectAnimator anim = ObjectAnimator.ofFloat(gpsDot, "alpha", 0.3f, 1f, 0.3f);
        anim.setDuration(1200);
        anim.setRepeatCount(ObjectAnimator.INFINITE);
        anim.start();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        if (requestCode == REQUEST_LOCATION
                && grantResults.length > 0
                && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            fetchGPS();
        } else {
            showGpsLoading(false);
            tvGpsLocation.setText("Permission GPS refusée");
        }
    }

    // ── Envoi SOS ─────────────────────────────────────────────────
    private void setupSendButton() {
        ivGpsRefresh.setOnClickListener(v -> fetchGPS());

        btnSendSos.setOnClickListener(v -> {
            if (selectedTypeId < 0) {
                Toast.makeText(requireContext(),
                        "Veuillez choisir un type d'urgence",
                        Toast.LENGTH_SHORT).show();
                return;
            }
            if (currentLat == 0.0 && currentLng == 0.0) {
                Toast.makeText(requireContext(),
                        "Position GPS non disponible",
                        Toast.LENGTH_SHORT).show();
                return;
            }
            sendSOSAlert();
        });
    }

    private void sendSOSAlert() {
        btnSendSos.setEnabled(false);
        btnSendSos.setText("Envoi en cours...");

        String message = etMessage.getText().toString().trim();

        SendAlertRequest request = new SendAlertRequest(
                selectedTypeId,
                currentLat,
                currentLng,
                message.isEmpty() ? null : message
        );

        RetrofitClient.getService().sendAlert(request)
                .enqueue(new Callback<SendAlertResponse>() {
                    @Override
                    public void onResponse(Call<SendAlertResponse> call,
                                           Response<SendAlertResponse> response) {
                        if (!isAdded()) return;
                        if (response.isSuccessful() && response.body() != null) {
                            int alertId = response.body().getEmergencyRequestId();
                            onSOSSent(alertId);
                        } else {
                            btnSendSos.setEnabled(true);
                            btnSendSos.setText("Envoyer l'alerte SOS");
                            Toast.makeText(requireContext(),
                                    "Erreur envoi alerte", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<SendAlertResponse> call, Throwable t) {
                        if (!isAdded()) return;
                        btnSendSos.setEnabled(true);
                        btnSendSos.setText("Envoyer l'alerte SOS");
                        Toast.makeText(requireContext(),
                                "Erreur réseau : " + t.getMessage(),
                                Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void onSOSSent(int alertId) {
        SuiviFragment suivi = SuiviFragment.newInstance(alertId);
        requireActivity().getSupportFragmentManager()
                .beginTransaction()
                .setCustomAnimations(android.R.anim.fade_in, android.R.anim.fade_out)
                .replace(R.id.fragment_container, suivi)
                .addToBackStack(null)
                .commit();

        Toast.makeText(requireContext(),
                "Alerte envoyée ! Un agent arrive.",
                Toast.LENGTH_LONG).show();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        // Arrêter le GPS quand on quitte
        if (fusedLocationClient != null && locationCallback != null) {
            fusedLocationClient.removeLocationUpdates(locationCallback);
        }
    }
}
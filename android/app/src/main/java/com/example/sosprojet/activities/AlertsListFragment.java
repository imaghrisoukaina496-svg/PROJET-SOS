package com.example.sosprojet.activities;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
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

public class AlertsListFragment extends Fragment {

    private RecyclerView  recyclerView;
    private AlertAdapter  adapter;
    private ProgressBar   progressBar;
    private TextView      tvEmpty;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_alerts_list, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        progressBar  = view.findViewById(R.id.progress_alerts);
        tvEmpty      = view.findViewById(R.id.tv_empty);
        recyclerView = view.findViewById(R.id.rv_alerts);

        recyclerView.setLayoutManager(new LinearLayoutManager(requireContext()));
        adapter = new AlertAdapter(new ArrayList<>(), request -> {
            if (getActivity() instanceof MainActivity) {
                ((MainActivity) getActivity()).openSuivi(request.getId());
            }
        });
        recyclerView.setAdapter(adapter);

        loadMyAlerts();
    }

    private void loadMyAlerts() {
        progressBar.setVisibility(View.VISIBLE);
        tvEmpty.setVisibility(View.GONE);

        RetrofitClient.getService().getMyAlerts()
                .enqueue(new Callback<List<EmergencyRequest>>() {
                    @Override
                    public void onResponse(Call<List<EmergencyRequest>> call,
                                           Response<List<EmergencyRequest>> response) {
                        if (!isAdded()) return;
                        progressBar.setVisibility(View.GONE);

                        if (response.isSuccessful() && response.body() != null) {
                            List<EmergencyRequest> alerts = response.body();
                            adapter.updateAlerts(alerts);
                            tvEmpty.setVisibility(alerts.isEmpty() ? View.VISIBLE : View.GONE);
                        } else {
                            Toast.makeText(requireContext(),
                                    "Erreur chargement alertes", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<List<EmergencyRequest>> call, Throwable t) {
                        if (!isAdded()) return;
                        progressBar.setVisibility(View.GONE);
                        Toast.makeText(requireContext(),
                                "Erreur réseau", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    @Override
    public void onResume() {
        super.onResume();
        // Recharger quand on revient sur cet écran
        loadMyAlerts();
    }
}
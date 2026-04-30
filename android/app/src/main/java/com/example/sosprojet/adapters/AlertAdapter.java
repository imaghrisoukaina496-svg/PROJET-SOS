package com.example.sosprojet.adapters;

import android.content.Context;
import android.graphics.drawable.GradientDrawable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;
import com.example.sosprojet.R;
import com.example.sosprojet.models.EmergencyRequest;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

public class AlertAdapter extends RecyclerView.Adapter<AlertAdapter.ViewHolder> {

    public interface OnAlertClickListener {
        void onAlertClick(EmergencyRequest request);
    }

    private final List<EmergencyRequest> alerts;
    private final OnAlertClickListener   listener;

    public AlertAdapter(List<EmergencyRequest> alerts, OnAlertClickListener listener) {
        this.alerts   = alerts;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_alert_row, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        EmergencyRequest req = alerts.get(position);
        holder.bind(req);
        holder.itemView.setOnClickListener(v -> {
            if (listener != null) listener.onAlertClick(req);
        });
    }

    @Override
    public int getItemCount() { return alerts.size(); }

    public void updateAlerts(List<EmergencyRequest> newList) {
        alerts.clear();
        alerts.addAll(newList);
        notifyDataSetChanged();
    }

    // ── ViewHolder ────────────────────────────────────────────────
    static class ViewHolder extends RecyclerView.ViewHolder {

        private final View     statusDot;
        private final TextView tvType;
        private final TextView tvMeta;
        private final TextView tvBadge;

        ViewHolder(View v) {
            super(v);
            statusDot = v.findViewById(R.id.view_status_dot);
            tvType    = v.findViewById(R.id.tv_alert_type);
            tvMeta    = v.findViewById(R.id.tv_alert_meta);
            tvBadge   = v.findViewById(R.id.tv_status_badge);
        }

        void bind(EmergencyRequest req) {
            Context ctx = itemView.getContext();

            // Type avec majuscule
            String type = req.getEmergencyType() != null
                    ? capitalizeFirst(req.getEmergencyType())
                    : getTypeLabel(req.getEmergencyTypeId());
            tvType.setText(type);

            // Date formatée lisible
            tvMeta.setText(formatDate(req.getCreatedAt()));

            // Statut
            applyStatusStyle(ctx, req.getStatus());
        }

        // ── Format date ──────────────────────────────────────────
        private String formatDate(String raw) {
            if (raw == null) return "—";
            try {
                SimpleDateFormat input = new SimpleDateFormat(
                        "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.FRENCH);
                input.setTimeZone(TimeZone.getTimeZone("UTC"));
                Date date = input.parse(raw);
                SimpleDateFormat output = new SimpleDateFormat(
                        "dd MMM yyyy 'à' HH:mm", Locale.FRENCH);
                return output.format(date);
            } catch (Exception e) {
                try {
                    SimpleDateFormat input2 = new SimpleDateFormat(
                            "yyyy-MM-dd HH:mm:ss", Locale.FRENCH);
                    Date date = input2.parse(raw);
                    SimpleDateFormat output = new SimpleDateFormat(
                            "dd MMM yyyy 'à' HH:mm", Locale.FRENCH);
                    return output.format(date);
                } catch (Exception e2) {
                    return raw.length() > 16
                            ? raw.substring(0, 16).replace("T", " ")
                            : raw;
                }
            }
        }

        private String capitalizeFirst(String s) {
            if (s == null || s.isEmpty()) return s;
            return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
        }

        // ── Statut ───────────────────────────────────────────────
        private void applyStatusStyle(Context ctx, String status) {
            if (status == null) status = "ENVOYEE";
            int badgeTextColor, badgeBgRes;

            switch (status) {
                case "PRISE_EN_CHARGE":
                    badgeTextColor = ContextCompat.getColor(ctx, R.color.status_taken);
                    badgeBgRes     = R.drawable.bg_badge_taken;
                    tvBadge.setText("En charge");
                    break;
                case "EN_INTERVENTION":
                    badgeTextColor = ContextCompat.getColor(ctx, R.color.status_inter);
                    badgeBgRes     = R.drawable.bg_badge_inter;
                    tvBadge.setText("Intervention");
                    break;
                case "CLOTUREE":
                    badgeTextColor = ContextCompat.getColor(ctx, R.color.status_closed);
                    badgeBgRes     = R.drawable.bg_badge_closed;
                    tvBadge.setText("Cloturee");
                    break;
                default:
                    badgeTextColor = ContextCompat.getColor(ctx, R.color.status_sent);
                    badgeBgRes     = R.drawable.bg_badge_sent;
                    tvBadge.setText("Envoyee");
                    break;
            }

            GradientDrawable dot = new GradientDrawable();
            dot.setShape(GradientDrawable.OVAL);
            dot.setColor(badgeTextColor);
            statusDot.setBackground(dot);

            tvBadge.setTextColor(badgeTextColor);
            tvBadge.setBackgroundResource(badgeBgRes);
        }

        private String getTypeLabel(int typeId) {
            switch (typeId) {
                case 1: return "Urgence medicale";
                case 2: return "Securite";
                case 3: return "Incendie";
                default: return "Autre";
            }
        }
    }
}
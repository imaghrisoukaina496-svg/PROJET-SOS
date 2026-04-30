package com.example.sosprojet.activities;

import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;
import com.example.sosprojet.R;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import android.content.SharedPreferences;
import androidx.appcompat.app.AppCompatDelegate;
/**
 * Activité principale : gère la BottomNavigationView et le swap de fragments
 * Thème dark identique au dashboard React (bg #0D0D0D, rouge #DC2626)
 */
public class MainActivity extends AppCompatActivity {

    private BottomNavigationView bottomNav;
    private HomeFragment homeFragment;
    private AlertsListFragment alertsListFragment;
    private ProfileFragment profileFragment;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initFragments();
        setupBottomNav();

        // Fragment par défaut
        if (savedInstanceState == null) {
            loadFragment(homeFragment, false);
        }
    }

    private void initFragments() {
        homeFragment       = new HomeFragment();
        alertsListFragment = new AlertsListFragment();
        profileFragment    = new ProfileFragment();
    }

    private void setupBottomNav() {
        bottomNav = findViewById(R.id.bottom_navigation);

        bottomNav.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            if (id == R.id.nav_home) {
                loadFragment(homeFragment, false);
                return true;
            } else if (id == R.id.nav_alerts) {
                loadFragment(alertsListFragment, false);
                return true;
            } else if (id == R.id.nav_profile) {
                loadFragment(profileFragment, false);
                return true;
            }
            return false;
        });
    }

    /**
     * Charge un fragment dans le container principal
     * @param addToBackStack true pour permettre le retour arrière
     */
    public void loadFragment(Fragment fragment, boolean addToBackStack) {
        FragmentTransaction transaction = getSupportFragmentManager()
                .beginTransaction()
                .setCustomAnimations(android.R.anim.fade_in, android.R.anim.fade_out)
                .replace(R.id.fragment_container, fragment);

        if (addToBackStack) {
            transaction.addToBackStack(null);
        }
        transaction.commit();
    }

    /**
     * Navigue vers le formulaire SOS avec un type présélectionné
     * Appelé depuis HomeFragment quand l'utilisateur clique sur un type
     */
    public void openSOSForm(int preselectedTypeId) {
        SOSFormFragment form = SOSFormFragment.newInstance(preselectedTypeId);
        loadFragment(form, true);
        // Cacher la bottom nav pendant le formulaire
        bottomNav.setVisibility(android.view.View.GONE);
    }

    /**
     * Navigue vers le suivi d'une alerte spécifique
     */
    public void openSuivi(int requestId) {
        SuiviFragment suivi = SuiviFragment.newInstance(requestId);
        loadFragment(suivi, true);
        bottomNav.setVisibility(android.view.View.GONE);
    }

    /** Affiche à nouveau la BottomNav (appelé par les fragments via getActivity()) */
    public void showBottomNav() {
        bottomNav.setVisibility(android.view.View.VISIBLE);
    }

    @Override
    public void onBackPressed() {
        if (getSupportFragmentManager().getBackStackEntryCount() > 0) {
            getSupportFragmentManager().popBackStack();
            showBottomNav();
        } else {
            super.onBackPressed();
        }
    }
    /** Appelé depuis ProfileFragment pour changer le thème */
    public void toggleTheme(boolean isDark) {
        SharedPreferences.Editor editor = getSharedPreferences(
                "sos_prefs", MODE_PRIVATE).edit();
        editor.putBoolean("dark_mode", isDark);
        editor.apply();

        AppCompatDelegate.setDefaultNightMode(
                isDark ? AppCompatDelegate.MODE_NIGHT_YES
                        : AppCompatDelegate.MODE_NIGHT_NO);
        recreate();
    }
}
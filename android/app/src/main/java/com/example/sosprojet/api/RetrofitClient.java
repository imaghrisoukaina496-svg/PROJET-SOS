package com.example.sosprojet.api;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import java.util.concurrent.TimeUnit;

public class RetrofitClient {

    private static final String TAG      = "RetrofitClient";
    //private static final String BASE_URL = "http://192.168.1.6:5000/";

    private static final String BASE_URL = "https://doorframe-bristle-uncivil.ngrok-free.dev/";
    private static Retrofit retrofit   = null;
    private static Context  appContext = null;

    public static void init(Context context) {
        appContext = context.getApplicationContext();
        retrofit  = null;
    }

    public static ApiService getService() {
        if (retrofit == null) build();
        return retrofit.create(ApiService.class);
    }

    private static void build() {
        HttpLoggingInterceptor logging = new HttpLoggingInterceptor(
                message -> Log.d(TAG, message));
        logging.setLevel(HttpLoggingInterceptor.Level.BODY);

        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .addInterceptor(chain -> {
                    Request.Builder builder = chain.request().newBuilder()
                            .header("Content-Type", "application/json")
                            .header("Accept",       "application/json");

                    // Ajouter le token JWT
                    if (appContext != null) {
                        SharedPreferences prefs = appContext
                                .getSharedPreferences("sos_prefs", Context.MODE_PRIVATE);
                        String token = prefs.getString("jwt_token", null);
                        if (token != null && !token.isEmpty()) {
                            builder.header("Authorization", "Bearer " + token);
                            Log.d(TAG, "Token ajouté : Bearer " + token.substring(0, 20) + "...");
                        } else {
                            Log.w(TAG, "Aucun token trouvé !");
                        }
                    } else {
                        Log.e(TAG, "appContext est null !");
                    }

                    return chain.proceed(builder.build());
                })
                .addInterceptor(logging)
                .build();

        retrofit = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
    }
}
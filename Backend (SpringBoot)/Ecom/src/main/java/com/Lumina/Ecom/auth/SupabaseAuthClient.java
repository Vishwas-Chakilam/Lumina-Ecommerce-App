package com.Lumina.Ecom.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class SupabaseAuthClient {

    private final String supabaseAuthBaseUrl;
    private final String serviceKey;

    public SupabaseAuthClient(
            @Value("${supabase.url}") String supabaseUrl,
            @Value("${supabase.service-key}") String serviceKey
    ) {
        this.supabaseAuthBaseUrl = supabaseUrl.endsWith("/") ? supabaseUrl + "auth/v1" : supabaseUrl + "/auth/v1";
        this.serviceKey = serviceKey;
    }

    private RestClient client() {
        return RestClient.builder()
                .baseUrl(supabaseAuthBaseUrl)
                .defaultHeader("apikey", serviceKey)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + serviceKey)
                .build();
    }

    public SupabaseUser signUp(String email, String password) {
        // Use admin endpoint so we always get a user object back
        AdminCreateUserRequest body = new AdminCreateUserRequest(email, password, true);
        AdminUserResponse response = client()
                .post()
                .uri("/admin/users")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(AdminUserResponse.class);
        if (response == null || response.user == null) {
            throw new IllegalStateException("Supabase sign up failed");
        }
        return response.user;
    }

    public SupabaseUser signIn(String email, String password) {
        SignInRequest body = new SignInRequest(email, password);
        SignInResponse response = client()
                .post()
                .uri("/token?grant_type=password")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(SignInResponse.class);
        if (response == null || response.user == null) {
            throw new IllegalStateException("Supabase sign in failed");
        }
        return response.user;
    }

    public record SupabaseUser(String id, String email) {
    }

    private record AdminCreateUserRequest(String email, String password, boolean email_confirm) {
    }

    private static class AdminUserResponse {
        public SupabaseUser user;
    }

    private record SignInRequest(String email, String password) {
    }

    private static class SignInResponse {
        public String access_token;
        public SupabaseUser user;
    }
}


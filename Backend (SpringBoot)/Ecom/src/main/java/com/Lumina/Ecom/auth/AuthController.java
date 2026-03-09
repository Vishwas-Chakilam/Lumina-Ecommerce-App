package com.Lumina.Ecom.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final SupabaseAuthClient supabaseAuthClient;

    public AuthController(SupabaseAuthClient supabaseAuthClient) {
        this.supabaseAuthClient = supabaseAuthClient;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody AuthRequest request) {
        try {
            SupabaseAuthClient.SupabaseUser user =
                    supabaseAuthClient.signUp(request.email(), request.password());
            return ResponseEntity.ok(new AuthResponse(user.id(), user.email()));
        } catch (HttpClientErrorException e) {
            String body = e.getResponseBodyAsString();
            if (e.getStatusCode() == HttpStatus.UNPROCESSABLE_ENTITY && body.contains("email_exists")) {
                // Soft error: user already registered
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new ErrorResponse("EMAIL_EXISTS",
                                "A user with this email is already registered. Please sign in or check your inbox for confirmation."));
            }
            throw e;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        SupabaseAuthClient.SupabaseUser user = supabaseAuthClient.signIn(request.email(), request.password());
        return ResponseEntity.ok(new AuthResponse(user.id(), user.email()));
    }

    public record AuthRequest(String email, String password) {
    }

    public record AuthResponse(String id, String email) {
    }

    public record ErrorResponse(String code, String message) {
    }
}


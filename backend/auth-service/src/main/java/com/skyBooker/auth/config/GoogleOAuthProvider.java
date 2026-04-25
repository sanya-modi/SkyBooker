package com.skyBooker.auth.config;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.skyBooker.auth.dto.GoogleTokenPayload;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class GoogleOAuthProvider {

    @Value("${google.oauth.client-id}")
    private String googleClientId;

    private GoogleIdTokenVerifier verifier;

    public GoogleOAuthProvider() {
    }

    private GoogleIdTokenVerifier getVerifier() {
        if (verifier == null) {
            verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
        }
        return verifier;
    }

    public String verifyGoogleToken(String idTokenString) {
        try {
            var idToken = getVerifier().verify(idTokenString);
            if (idToken != null) {
                return (String) idToken.getPayload().get("email");
            }
        } catch (Exception e) {
            throw new RuntimeException("Invalid Google token: " + e.getMessage());
        }
        return null;
    }

    public GoogleTokenPayload getTokenPayload(String idTokenString) {
        try {
            var idToken = getVerifier().verify(idTokenString);
            if (idToken != null) {
                var payload = idToken.getPayload();
                return GoogleTokenPayload.builder()
                        .email((String) payload.get("email"))
                        .name((String) payload.get("name"))
                        .picture((String) payload.get("picture"))
                        .sub((String) payload.get("sub"))
                        .build();
            }
        } catch (Exception e) {
            throw new RuntimeException("Invalid Google token: " + e.getMessage());
        }
        return null;
    }
}

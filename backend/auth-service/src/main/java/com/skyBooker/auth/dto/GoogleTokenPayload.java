package com.skyBooker.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GoogleTokenPayload {
    private String email;
    private String name;
    private String picture;
    private String sub;
}

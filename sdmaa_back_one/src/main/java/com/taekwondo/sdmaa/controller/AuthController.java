package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.dto.auth.AuthResponse;
import com.taekwondo.sdmaa.dto.auth.LoginRequest;
import com.taekwondo.sdmaa.dto.auth.RegisterCompleteRequest;
import com.taekwondo.sdmaa.dto.auth.RegisterRequest;
import com.taekwondo.sdmaa.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        return service.register(request);
    }

    @PostMapping("/register-complet")
    public AuthResponse registerComplet(
            @Valid @RequestBody RegisterCompleteRequest request
    ) {
        return service.registerComplet(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return service.login(request);
    }
}

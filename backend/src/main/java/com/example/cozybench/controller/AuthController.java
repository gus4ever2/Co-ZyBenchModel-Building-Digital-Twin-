package com.example.cozybench.controller;

import com.example.cozybench.dto.LoginRequest;
import com.example.cozybench.dto.SignUpRequest;
import com.example.cozybench.model.User;
import com.example.cozybench.service.UserService;

import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.crypto.SecretKey;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private SecretKey secretKey; 

    // In-memory blacklist to store invalidated tokens
    private static final Set<String> tokenBlacklist = new HashSet<>();

    @PostMapping("/signup")
    public ResponseEntity<String> register(@RequestBody SignUpRequest signUpRequest) {
        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(signUpRequest.getPassword());
        userService.registerUser(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest loginRequest) {
        User user = userService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());

        // Generate JWT
        String token = Jwts.builder()
            .setSubject(user.getEmail())
            .setExpiration(new Date(System.currentTimeMillis() + 864_000_00)) // 1 day
            .signWith(secretKey)// Use HMAC with the secret key
            .compact();
            
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
        // Extract the token from the "Bearer <token>" format
        String jwtToken = extractToken(token);

        // Add the token to the blacklist
        tokenBlacklist.add(jwtToken);
        return ResponseEntity.ok("Logged out successfully");
    }

    // Helper method to extract the token from the Authorization header
    private String extractToken(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7); // Remove "Bearer " prefix
        }
        throw new IllegalArgumentException("Invalid Authorization header");
    }

    // Method to check if a token is blacklisted (can be used in your JWT filter)
    public static boolean isTokenBlacklisted(String token) {
        return tokenBlacklist.contains(token);
    }
}
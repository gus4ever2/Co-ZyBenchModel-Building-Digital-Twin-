package com.example.cozybench.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.cozybench.controller.AuthController;

import java.io.IOException;

import javax.crypto.SecretKey;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final UserDetailsService userDetailsService;
    @Autowired
    private SecretKey secretKey;  // Use a secure key management system in production

    public JwtAuthenticationFilter(UserDetailsService userDetailsService2) {
        this.userDetailsService = userDetailsService2;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        // Check if the Authorization header is present and starts with "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("No JWT token found in the request headers.");
            filterChain.doFilter(request, response);
            return;
        }

        // Extract the JWT token from the Authorization header
        String token = authHeader.substring(7); // Remove "Bearer "
        logger.info("JWT token extracted: " + token);

        // Extract the username (email) from the JWT token
        String username = extractUsername(token);
        logger.info("Username extracted from JWT: " + username);

        // If the username is not null and there is no existing authentication in the SecurityContext
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                // Load the UserDetails object from the database
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                logger.info("UserDetails loaded: " + userDetails.getUsername());
                
                if (AuthController.isTokenBlacklisted(token)) {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token is invalidated");
                    return;
                }
                // Validate the JWT token
                if (isTokenValid(token, userDetails)) {
                    logger.info("JWT token is valid. Setting authentication in SecurityContextHolder.");

                    // Create an Authentication object and set it in the SecurityContext
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    logger.warn("JWT token is invalid.");
                }
            } catch (UsernameNotFoundException e) {
                logger.error("User not found: " + e.getMessage());
            } catch (Exception e) {
                logger.error("Error during authentication: " + e.getMessage(), e);
            }
        }

        // Continue the filter chain
        filterChain.doFilter(request, response);
    }

    private String extractUsername(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        logger.info("JWT claims: " + claims); // Debugging
        String username = claims.getSubject(); // Returns the email (sub claim)
        logger.info("Extracted username (email): " + username); // Debugging
        return username;
    }

    private boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getExpiration().before(new java.util.Date());
    }
}
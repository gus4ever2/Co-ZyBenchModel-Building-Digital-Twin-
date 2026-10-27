package com.cozybench.auth.service;

import com.cozybench.auth.dto.AuthResponse;
import com.cozybench.auth.dto.SignInRequest;
import com.cozybench.auth.dto.SignUpRequest;
import com.cozybench.auth.exception.EmailAlreadyExistsException;
import com.cozybench.auth.exception.InvalidCredentialsException;
import com.cozybench.user.mapper.UserMapper;
import com.cozybench.user.model.UserAccount;
import com.cozybench.user.repository.UserAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class AuthenticationService {

    private static final Logger log =
            LoggerFactory.getLogger(AuthenticationService.class);

    private final UserAccountRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    public AuthenticationService(
            UserAccountRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserMapper userMapper
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userMapper = userMapper;
    }

    public AuthResponse signUp(SignUpRequest request) {
        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException();
        }

        UserAccount user = UserAccount.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .firstName(request.firstName().trim())
                .lastName(request.lastName().trim())
                .profileType(request.profileType())
                .build();

        try {
            user = userRepository.save(user);
        } catch (DuplicateKeyException exception) {
            throw new EmailAlreadyExistsException();
        }

        log.info("User account created: userId={}", user.getId());
        return createAuthResponse(user);
    }

    public AuthResponse signIn(SignInRequest request) {
        String email = normalizeEmail(request.email());

        UserAccount user = userRepository.findByEmail(email)
                .filter(UserAccount::isEnabled)
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        log.info("User signed in: userId={}", user.getId());
        return createAuthResponse(user);
    }

    private AuthResponse createAuthResponse(UserAccount user) {
        JwtService.IssuedToken token = jwtService.generateToken(user);

        return new AuthResponse(
                token.value(),
                "Bearer",
                token.expiresInSeconds(),
                userMapper.toResponse(user)
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}

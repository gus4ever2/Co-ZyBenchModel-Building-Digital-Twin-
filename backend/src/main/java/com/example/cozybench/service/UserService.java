package com.example.cozybench.service;

import com.example.cozybench.model.User;
import com.example.cozybench.repository.UserRepository;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println("Loading user by email: " + email); // Debugging
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            System.out.println("User found: " + user); // Debugging: Log the User object
            System.out.println("User email: " + user.getEmail()); // Debugging: Log the email
            System.out.println("User password: " + user.getPassword()); // Debugging: Log the password
            return user; // Return the User object (implements UserDetails)
        } else {
            System.out.println("User not found for email: " + email); // Debugging
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
    }

    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already in use.");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User authenticate(String email, String password) {
        UserDetails user =  loadUserByUsername(email);
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password.");
        }
        return (User) user;
    }

    public Optional<User> findByEmail(String userEmail) {
        return userRepository.findByEmail(userEmail);
    }

    public void save(User user) {
        userRepository.save(user);
    }
}
package com.cozybench.user.dto;

import com.cozybench.user.model.ProfileType;
import com.cozybench.user.model.Role;

import java.util.Set;

public record UserResponse(
        String id,
        String email,
        String firstName,
        String lastName,
        ProfileType profileType,
        Set<Role> roles
) {
    public UserResponse {
        roles = Set.copyOf(roles);
    }
}
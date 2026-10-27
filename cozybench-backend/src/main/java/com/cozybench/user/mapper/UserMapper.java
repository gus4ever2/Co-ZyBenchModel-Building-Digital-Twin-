package com.cozybench.user.mapper;

import com.cozybench.user.dto.UserResponse;
import com.cozybench.user.model.UserAccount;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(UserAccount user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getProfileType(),
                user.getRoles()
        );
    }
}
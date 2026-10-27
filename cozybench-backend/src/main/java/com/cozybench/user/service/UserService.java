package com.cozybench.user.service;

import com.cozybench.user.dto.UserResponse;
import com.cozybench.user.exception.UserNotFoundException;
import com.cozybench.user.mapper.UserMapper;
import com.cozybench.user.repository.UserAccountRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserAccountRepository userRepository;
    private final UserMapper userMapper;

    public UserService(
            UserAccountRepository userRepository,
            UserMapper userMapper
    ) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    public UserResponse getCurrentUser(String userId) {
        return userRepository.findById(userId)
                .map(userMapper::toResponse)
                .orElseThrow(UserNotFoundException::new);
    }
}

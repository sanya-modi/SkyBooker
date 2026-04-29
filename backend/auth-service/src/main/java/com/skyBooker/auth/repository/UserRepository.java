package com.skyBooker.auth.repository;

import com.skyBooker.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    Optional<User> findByIdAndIsActiveTrue(Long id);

    Optional<User> findByEmailAndIsActiveTrue(String email);

    List<User> findByIsActiveTrue();

    Optional<User> findByResetToken(String resetToken);
}
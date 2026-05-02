package com.skyBooker.auth.repository;

import com.skyBooker.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminUserQueryRepository extends JpaRepository<User, Long> {
    List<User> findAllByOrderByIdDesc();
}

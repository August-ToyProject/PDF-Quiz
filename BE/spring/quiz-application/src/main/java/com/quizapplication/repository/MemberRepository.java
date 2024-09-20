package com.quizapplication.repository;

import com.quizapplication.domain.Member;
import com.quizapplication.domain.SocialType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {

    boolean existsByEmail(String email);
    Member findByEmail(String email);
    Member findByUserId(String userId);
    Member findBySocialTypeAndSocialId(SocialType socialType, String id);
}

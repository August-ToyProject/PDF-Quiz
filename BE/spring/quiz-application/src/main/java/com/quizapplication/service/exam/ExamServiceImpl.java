package com.quizapplication.service.exam;

import com.quizapplication.config.security.SecurityUtil;
import com.quizapplication.dto.response.exam.ExamResponse;
import com.quizapplication.repository.MemberRepository;
import com.quizapplication.repository.exam.ExamRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final MemberRepository memberRepository;

    @Override
    public List<ExamResponse> getExams() {
        Long memberId = memberRepository.findByEmail(SecurityUtil.getCurrentMemberEmail()).getId();
        return examRepository.findByMemberId(memberId).stream()
            .map(exam -> ExamResponse.of(exam.getId(), exam.getTitle(), exam.getCreatedDate()))
            .collect(Collectors.toList());
    }

}

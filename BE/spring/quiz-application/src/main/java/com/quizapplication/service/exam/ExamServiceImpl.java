package com.quizapplication.service.exam;

import com.quizapplication.config.security.SecurityUtil;
import com.quizapplication.domain.exam.Exam;
import com.quizapplication.domain.folder.Folder;
import com.quizapplication.dto.response.FolderResponse;
import com.quizapplication.dto.response.exam.ExamResponse;
import com.quizapplication.repository.MemberRepository;
import com.quizapplication.repository.exam.ExamRepository;
import com.quizapplication.repository.folder.FolderRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExamServiceImpl implements ExamService {

    private final FolderRepository folderRepository;
    private final ExamRepository examRepository;
    private final MemberRepository memberRepository;

    @Override
    public List<ExamResponse> getExams() {
        Long memberId = memberRepository.findByEmail(SecurityUtil.getCurrentMemberEmail()).getId();
        return examRepository.findByMemberId(memberId).stream()
            .map(exam -> ExamResponse.of(exam.getId(), exam.getTitle(), exam.getCreatedDate()))
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteExam(Long examId) {
        Exam exam = examRepository.findByIdAndMemberId(examId,
                memberRepository.findByEmail(SecurityUtil.getCurrentMemberEmail()).getId());
        examRepository.delete(exam);
    }

    @Override
    @Transactional
    public FolderResponse updateExam(Long examId, Long folderId) {
        Exam exam = examRepository.findByIdAndMemberId(examId,
                memberRepository.findByEmail(SecurityUtil.getCurrentMemberEmail()).getId());
        Folder folder = folderRepository.findByIdAndMemberId(folderId,
                memberRepository.findByEmail(SecurityUtil.getCurrentMemberEmail()).getId());
        exam.updateFolder(folder);
        folder.addExam(exam);
        return FolderResponse.of(exam.getFolder());
    }

}

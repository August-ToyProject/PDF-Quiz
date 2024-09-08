package com.quizapplication.service.exam;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizapplication.config.security.SecurityUtil;
import com.quizapplication.domain.Answer;
import com.quizapplication.domain.exam.Exam;
import com.quizapplication.domain.folder.Folder;
import com.quizapplication.domain.quiz.Quiz;
import com.quizapplication.dto.request.exam.ExamResultRequest;
import com.quizapplication.dto.response.FolderResponse;
import com.quizapplication.dto.response.exam.ExamResponse;
import com.quizapplication.dto.response.exam.ExamResultResponse;
import com.quizapplication.dto.response.quiz.QuizResult;
import com.quizapplication.dto.response.quiz.QuizResultResponse;
import com.quizapplication.repository.MemberRepository;
import com.quizapplication.repository.answer.AnswerRepository;
import com.quizapplication.repository.exam.ExamRepository;
import com.quizapplication.repository.folder.FolderRepository;
import com.quizapplication.repository.quiz.QuizRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExamServiceImpl implements ExamService {

    private final FolderRepository folderRepository;
    private final ExamRepository examRepository;
    private final MemberRepository memberRepository;
    private final QuizRepository quizRepository;
    private final AnswerRepository answerRepository;
    private ObjectMapper objectMapper = new ObjectMapper();

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

    @Override
    @Transactional
    public ExamResultResponse saveExam(ExamResultRequest request) {
        Exam exam = request.toEntity(memberRepository.findByEmail(SecurityUtil.getCurrentMemberEmail()));
        List<QuizResult> result = request.getExam();
        List<QuizResultResponse> quizResults = new ArrayList<>();

        for (QuizResult quizResult : result) {
            Quiz quiz = quizRepository.findById(quizResult.getQuizId()).get();
            quiz.updateExam(exam);
            Map<String, String> map = convertOptions(quiz.getOptions());
            map.put("0", "풀지 않은 문제입니다");

            String pickedNum = quizResult.getAnswer();
            String pickedDescription = map.get(pickedNum);

            String pickedOption = answerToJson(Map.of(pickedNum, pickedDescription));

            Answer answer = Answer.builder()
                    .quiz(quiz)
                    .pickedOptions(pickedOption)
                    .correct(quizResult.isCorrect())
                    .build();
            Answer savedAnswer = answerRepository.save(answer);
            quiz.updateUserAnswer(savedAnswer);
            quizResults.add(QuizResultResponse.of(quiz, savedAnswer));
        }
        examRepository.save(exam);

        return ExamResultResponse.of(exam, quizResults);
    }

    @Override
    public ExamResultResponse getExam(Long examId) {
        Exam exam = examRepository.findByIdAndMemberId(examId,
                memberRepository.findByEmail(SecurityUtil.getCurrentMemberEmail()).getId());
        List<QuizResultResponse> quizResults = new ArrayList<>();
        List<Quiz> quizzes = exam.getQuizzes();

        for (Quiz quiz : quizzes) {
            quizResults.add(QuizResultResponse.of(quiz, quiz.getUserAnswer()));
        }

        return ExamResultResponse.of(exam, quizResults);
    }

    /**
     * JSON 문자열을 Map으로 변환
     */
    private Map<String, String> convertOptions(String options) {
        try {
            return objectMapper.readValue(options, Map.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to convert options");
        }
    }

    /**
     * Map을 JSON 문자열로 변환
     */
    private String answerToJson(Map<String, String> answer) {
        try {
            return objectMapper.writeValueAsString(answer);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to convert answer");
        }
    }

}

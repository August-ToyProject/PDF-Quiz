package com.quizapplication.dto.response;

import com.quizapplication.domain.folder.Folder;
import com.quizapplication.dto.response.exam.ExamResponse;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FolderResponse {

    private Long folderId;
    private String folderName;
    private List<ExamResponse> exams;

    public static FolderResponse of(Folder folder) {
        return FolderResponse.builder()
                .exams(folder.getExams() != null ?
                        folder.getExams().stream()
                                .map(e -> ExamResponse.of(e.getId(), e.getTitle(), e.getCreatedDate()))
                                .toList()
                        : List.of())
                .folderId(folder.getId())
                .folderName(folder.getFolderName())
                .build();
    }
}

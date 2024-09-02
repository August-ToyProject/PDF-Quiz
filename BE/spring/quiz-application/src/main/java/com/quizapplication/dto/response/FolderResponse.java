package com.quizapplication.dto.response;

import com.quizapplication.domain.folder.Folder;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FolderResponse {

    private Long folderId;
    private String folderName;

    public static FolderResponse of(Folder folder) {
        return FolderResponse.builder()
                .folderId(folder.getId())
                .folderName(folder.getFolderName())
                .build();
    }
}

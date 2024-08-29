package com.quizapplication.dto.response;

import com.quizapplication.domain.folder.Folder;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FolderResponse {

    private String folderName;

    public static FolderResponse of(Folder folder) {
        return FolderResponse.builder()
                .folderName(folder.getFolderName())
                .build();
    }
}

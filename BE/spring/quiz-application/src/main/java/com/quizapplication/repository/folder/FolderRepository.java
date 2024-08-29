package com.quizapplication.repository.folder;

import com.quizapplication.domain.folder.Folder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FolderRepository extends JpaRepository<Folder, Long> {
    Folder findByIdAndMemberId(Long folderId, Long memberId);
}

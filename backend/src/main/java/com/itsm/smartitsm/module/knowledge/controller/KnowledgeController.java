package com.itsm.smartitsm.module.knowledge.controller;

import com.itsm.smartitsm.common.result.PageResult;
import com.itsm.smartitsm.common.result.Result;
import com.itsm.smartitsm.module.knowledge.dto.KnowledgeDocumentCreateDTO;
import com.itsm.smartitsm.module.knowledge.dto.KnowledgeQueryDTO;
import com.itsm.smartitsm.module.knowledge.service.KnowledgeService;
import com.itsm.smartitsm.module.knowledge.vo.KnowledgeDocumentVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 知识库接口
 */
@RestController
@RequestMapping("/api/v1/knowledge/documents")
@RequiredArgsConstructor
public class KnowledgeController {

    private final KnowledgeService knowledgeService;

    /**
     * 分页查询知识文档（普通用户仅返回已发布）
     */
    @GetMapping
    public Result<PageResult<KnowledgeDocumentVO>> page(KnowledgeQueryDTO query) {
        return Result.success(knowledgeService.pageDocuments(query));
    }

    /**
     * 查看知识文档详情
     */
    @GetMapping("/{documentId}")
    public Result<KnowledgeDocumentVO> detail(@PathVariable Long documentId) {
        return Result.success(knowledgeService.getDocument(documentId));
    }

    /**
     * 创建知识文档（初始为草稿）
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN') or hasAuthority('system:manage')")
    public Result<Long> create(@Valid @RequestBody KnowledgeDocumentCreateDTO dto) {
        return Result.success(knowledgeService.createDocument(dto));
    }

    /**
     * 发布知识文档
     */
    @PostMapping("/{documentId}/publish")
    @PreAuthorize("hasAnyRole('ADMIN') or hasAuthority('system:manage')")
    public Result<Void> publish(@PathVariable Long documentId) {
        knowledgeService.publishDocument(documentId);
        return Result.success();
    }

    /**
     * 下线知识文档
     */
    @PostMapping("/{documentId}/offline")
    @PreAuthorize("hasAnyRole('ADMIN') or hasAuthority('system:manage')")
    public Result<Void> offline(@PathVariable Long documentId) {
        knowledgeService.offlineDocument(documentId);
        return Result.success();
    }
}

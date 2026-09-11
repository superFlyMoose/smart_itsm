package com.itsm.smartitsm.module.knowledge.service;

import com.itsm.smartitsm.common.result.PageResult;
import com.itsm.smartitsm.module.knowledge.dto.KnowledgeDocumentCreateDTO;
import com.itsm.smartitsm.module.knowledge.dto.KnowledgeQueryDTO;
import com.itsm.smartitsm.module.knowledge.vo.KnowledgeDocumentVO;

/**
 * 知识库服务
 */
public interface KnowledgeService {

    /**
     * 分页查询知识文档（普通用户仅可见已发布）
     */
    PageResult<KnowledgeDocumentVO> pageDocuments(KnowledgeQueryDTO query);

    /**
     * 查看知识文档详情（普通用户仅可查看已发布）
     */
    KnowledgeDocumentVO getDocument(Long documentId);

    /**
     * 创建知识文档，初始状态为草稿
     */
    Long createDocument(KnowledgeDocumentCreateDTO dto);

    /**
     * 发布知识文档（DRAFT -> PUBLISHED）
     */
    void publishDocument(Long documentId);

    /**
     * 下线知识文档（PUBLISHED -> OFFLINE）
     */
    void offlineDocument(Long documentId);
}

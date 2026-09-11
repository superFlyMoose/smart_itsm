package com.itsm.smartitsm.module.knowledge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.itsm.smartitsm.common.enums.KnowledgeStatusEnum;
import com.itsm.smartitsm.common.exception.BusinessException;
import com.itsm.smartitsm.common.result.PageResult;
import com.itsm.smartitsm.common.result.ResultCode;
import com.itsm.smartitsm.common.util.PageUtil;
import com.itsm.smartitsm.module.category.entity.TicketCategory;
import com.itsm.smartitsm.module.category.mapper.TicketCategoryMapper;
import com.itsm.smartitsm.module.knowledge.dto.KnowledgeDocumentCreateDTO;
import com.itsm.smartitsm.module.knowledge.dto.KnowledgeQueryDTO;
import com.itsm.smartitsm.module.knowledge.entity.KnowledgeDocument;
import com.itsm.smartitsm.module.knowledge.mapper.KnowledgeDocumentMapper;
import com.itsm.smartitsm.module.knowledge.service.KnowledgeService;
import com.itsm.smartitsm.module.knowledge.vo.KnowledgeDocumentVO;
import com.itsm.smartitsm.module.user.entity.SysUser;
import com.itsm.smartitsm.module.user.mapper.SysUserMapper;
import com.itsm.smartitsm.security.LoginUser;
import com.itsm.smartitsm.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 知识库服务实现
 */
@Service
@RequiredArgsConstructor
public class KnowledgeServiceImpl implements KnowledgeService {

    private final KnowledgeDocumentMapper knowledgeDocumentMapper;
    private final TicketCategoryMapper ticketCategoryMapper;
    private final SysUserMapper sysUserMapper;

    @Override
    public PageResult<KnowledgeDocumentVO> pageDocuments(KnowledgeQueryDTO query) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        boolean canManage = loginUser.hasRole("ADMIN") || loginUser.hasPermission("system:manage");

        LambdaQueryWrapper<KnowledgeDocument> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(query.getTitle()), KnowledgeDocument::getTitle, query.getTitle())
                .eq(query.getCategoryId() != null, KnowledgeDocument::getCategoryId, query.getCategoryId())
                .eq(StringUtils.hasText(query.getStatus()), KnowledgeDocument::getStatus, query.getStatus());
        if (!canManage) {
            // 普通用户仅能查看已发布文档，忽略传入的状态条件
            wrapper.eq(KnowledgeDocument::getStatus, KnowledgeStatusEnum.PUBLISHED.name());
        }
        wrapper.orderByDesc(KnowledgeDocument::getCreatedAt);

        Page<KnowledgeDocument> page = knowledgeDocumentMapper.selectPage(
                PageUtil.build(query.getPageNum(), query.getPageSize()), wrapper);
        List<KnowledgeDocument> records = page.getRecords();
        Map<Long, String> categoryNames = batchLoadCategoryNames(records);
        Map<Long, String> uploaderNames = batchLoadUserNames(records);
        List<KnowledgeDocumentVO> voList = records.stream()
                .map(document -> toVO(document, categoryNames, uploaderNames))
                .toList();
        return PageResult.of(page, voList);
    }

    @Override
    public KnowledgeDocumentVO getDocument(Long documentId) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        KnowledgeDocument document = knowledgeDocumentMapper.selectById(documentId);
        if (document == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "知识文档不存在");
        }
        boolean canManage = loginUser.hasRole("ADMIN") || loginUser.hasPermission("system:manage");
        if (!canManage && !KnowledgeStatusEnum.PUBLISHED.name().equals(document.getStatus())) {
            throw new BusinessException(ResultCode.NOT_FOUND, "知识文档不存在或未发布");
        }
        return toVO(document, batchLoadCategoryNames(List.of(document)),
                batchLoadUserNames(List.of(document)));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createDocument(KnowledgeDocumentCreateDTO dto) {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        if (dto.getCategoryId() != null) {
            TicketCategory category = ticketCategoryMapper.selectById(dto.getCategoryId());
            if (category == null) {
                throw new BusinessException(ResultCode.NOT_FOUND, "文档分类不存在");
            }
        }
        KnowledgeDocument document = new KnowledgeDocument();
        document.setTitle(dto.getTitle());
        document.setFileUrl(dto.getFileUrl());
        document.setCategoryId(dto.getCategoryId());
        document.setUploaderId(loginUser.getUserId());
        // 数据库默认 PUBLISHED，业务要求初始为草稿，必须显式设置
        document.setStatus(KnowledgeStatusEnum.DRAFT.name());
        knowledgeDocumentMapper.insert(document);
        return document.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void publishDocument(Long documentId) {
        KnowledgeDocument document = getManageableDocument(documentId);
        if (!KnowledgeStatusEnum.DRAFT.name().equals(document.getStatus())) {
            throw new BusinessException(ResultCode.TICKET_STATUS_ERROR, "只有草稿状态的文档可以发布");
        }
        document.setStatus(KnowledgeStatusEnum.PUBLISHED.name());
        knowledgeDocumentMapper.updateById(document);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void offlineDocument(Long documentId) {
        KnowledgeDocument document = getManageableDocument(documentId);
        if (!KnowledgeStatusEnum.PUBLISHED.name().equals(document.getStatus())) {
            throw new BusinessException(ResultCode.TICKET_STATUS_ERROR, "只有已发布状态的文档可以下线");
        }
        document.setStatus(KnowledgeStatusEnum.OFFLINE.name());
        knowledgeDocumentMapper.updateById(document);
    }

    private KnowledgeDocument getManageableDocument(Long documentId) {
        KnowledgeDocument document = knowledgeDocumentMapper.selectById(documentId);
        if (document == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "知识文档不存在");
        }
        return document;
    }

    private KnowledgeDocumentVO toVO(KnowledgeDocument document, Map<Long, String> categoryNames,
                                     Map<Long, String> uploaderNames) {
        KnowledgeDocumentVO vo = new KnowledgeDocumentVO();
        vo.setId(document.getId());
        vo.setTitle(document.getTitle());
        vo.setFileUrl(document.getFileUrl());
        vo.setCategoryId(document.getCategoryId());
        vo.setCategoryName(document.getCategoryId() == null ? null
                : categoryNames.get(document.getCategoryId()));
        vo.setUploaderId(document.getUploaderId());
        vo.setUploaderName(document.getUploaderId() == null ? null
                : uploaderNames.get(document.getUploaderId()));
        vo.setStatus(document.getStatus());
        vo.setCreatedAt(document.getCreatedAt());
        vo.setUpdatedAt(document.getUpdatedAt());
        return vo;
    }

    private Map<Long, String> batchLoadCategoryNames(List<KnowledgeDocument> documents) {
        Set<Long> categoryIds = documents.stream()
                .map(KnowledgeDocument::getCategoryId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());
        if (categoryIds.isEmpty()) {
            return Map.of();
        }
        return ticketCategoryMapper.selectBatchIds(categoryIds).stream()
                .collect(Collectors.toMap(TicketCategory::getId, TicketCategory::getName, (a, b) -> a));
    }

    private Map<Long, String> batchLoadUserNames(List<KnowledgeDocument> documents) {
        Set<Long> userIds = documents.stream()
                .map(KnowledgeDocument::getUploaderId)
                .collect(Collectors.toCollection(HashSet::new));
        if (userIds.isEmpty()) {
            return Map.of();
        }
        return sysUserMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(SysUser::getId, SysUser::getRealName, (a, b) -> a));
    }
}

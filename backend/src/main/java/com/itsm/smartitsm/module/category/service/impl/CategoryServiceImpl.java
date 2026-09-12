package com.itsm.smartitsm.module.category.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.itsm.smartitsm.common.cache.CacheKeys;
import com.itsm.smartitsm.common.cache.RedisCacheService;
import com.itsm.smartitsm.common.exception.BusinessException;
import com.itsm.smartitsm.common.result.ResultCode;
import com.itsm.smartitsm.module.category.dto.CategorySaveDTO;
import com.itsm.smartitsm.module.category.entity.TicketCategory;
import com.itsm.smartitsm.module.category.mapper.TicketCategoryMapper;
import com.itsm.smartitsm.module.category.service.CategoryService;
import com.itsm.smartitsm.module.category.vo.CategoryTreeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 工单分类服务实现
 */
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    /** 分类树缓存 TTL：1 小时 */
    private static final Duration TREE_TTL = Duration.ofHours(1);

    private final TicketCategoryMapper ticketCategoryMapper;
    private final RedisCacheService cache;

    @Override
    public List<CategoryTreeVO> tree() {
        List<CategoryTreeVO> cached = cache.get(CacheKeys.CATEGORY_TREE);
        if (cached != null) {
            return cached;
        }
        List<TicketCategory> categories = ticketCategoryMapper.selectList(
                new LambdaQueryWrapper<TicketCategory>()
                        .eq(TicketCategory::getStatus, 1)
                        .orderByAsc(TicketCategory::getId));
        List<CategoryTreeVO> nodes = categories.stream().map(this::toTreeVO).toList();
        Map<Long, List<CategoryTreeVO>> childrenMap = nodes.stream()
                .filter(node -> node.getParentId() != null)
                .collect(Collectors.groupingBy(CategoryTreeVO::getParentId));
        List<CategoryTreeVO> roots = new ArrayList<>();
        for (CategoryTreeVO node : nodes) {
            node.setChildren(childrenMap.getOrDefault(node.getId(), new ArrayList<>()));
            if (node.getParentId() == null) {
                roots.add(node);
            }
        }
        cache.set(CacheKeys.CATEGORY_TREE, roots, TREE_TTL);
        return roots;
    }

    @Override
    public Long createCategory(CategorySaveDTO dto) {
        TicketCategory category = new TicketCategory();
        category.setName(dto.getName());
        category.setParentId(dto.getParentId());
        category.setDescription(dto.getDescription());
        category.setStatus(1);
        ticketCategoryMapper.insert(category);
        evictCache();
        return category.getId();
    }

    @Override
    public void updateCategory(Long categoryId, CategorySaveDTO dto) {
        TicketCategory category = getCategoryOrThrow(categoryId);
        category.setName(dto.getName());
        category.setParentId(dto.getParentId());
        category.setDescription(dto.getDescription());
        ticketCategoryMapper.updateById(category);
        evictCache();
    }

    @Override
    public void disableCategory(Long categoryId) {
        TicketCategory category = getCategoryOrThrow(categoryId);
        category.setStatus(0);
        ticketCategoryMapper.updateById(category);
        evictCache();
    }

    /**
     * 失效分类树与分类名称缓存
     */
    private void evictCache() {
        cache.delete(CacheKeys.CATEGORY_TREE);
        cache.deleteByPrefix(CacheKeys.CATEGORY_BASE_PREFIX);
    }

    private TicketCategory getCategoryOrThrow(Long categoryId) {
        TicketCategory category = ticketCategoryMapper.selectById(categoryId);
        if (category == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "分类不存在");
        }
        return category;
    }

    private CategoryTreeVO toTreeVO(TicketCategory category) {
        CategoryTreeVO vo = new CategoryTreeVO();
        vo.setId(category.getId());
        vo.setName(category.getName());
        vo.setParentId(category.getParentId());
        vo.setDescription(category.getDescription());
        return vo;
    }
}

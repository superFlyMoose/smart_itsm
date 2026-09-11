package com.itsm.smartitsm.common.util;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

/**
 * 分页工具，统一页码与每页大小的边界处理
 */
public final class PageUtil {

    /**
     * 默认页码
     */
    public static final int DEFAULT_PAGE_NUM = 1;

    /**
     * 默认每页大小
     */
    public static final int DEFAULT_PAGE_SIZE = 20;

    /**
     * 每页最大记录数
     */
    public static final int MAX_PAGE_SIZE = 100;

    private PageUtil() {
    }

    /**
     * 构建分页对象，pageSize 限制在 1~100
     */
    public static <T> Page<T> build(Integer pageNum, Integer pageSize) {
        int num = (pageNum == null || pageNum < 1) ? DEFAULT_PAGE_NUM : pageNum;
        int size = (pageSize == null || pageSize < 1)
                ? DEFAULT_PAGE_SIZE
                : Math.min(pageSize, MAX_PAGE_SIZE);
        return new Page<>(num, size);
    }
}

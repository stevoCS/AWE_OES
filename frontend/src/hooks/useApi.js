import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

// 通用API调用hook
export const useApi = (apiCall, dependencies = [], options = {}) => {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    if (options.immediate !== false) {
      execute();
    }
  }, dependencies);

  return { data, loading, error, execute, refetch: execute };
};

// 订单相关hooks
export const useOrders = (params = {}) => {
  return useApi(() => apiService.getOrders(params), [JSON.stringify(params)]);
};

export const useOrder = (orderId) => {
  return useApi(() => apiService.getOrder(orderId), [orderId], {
    immediate: !!orderId
  });
};

export const useOrderStats = (period = '30d') => {
  return useApi(() => apiService.getOrderStats(period), [period]);
};

// 产品相关hooks
export const useProducts = (params = {}) => {
  return useApi(() => apiService.getProducts(params), [JSON.stringify(params)]);
};

export const useProduct = (productId) => {
  return useApi(() => apiService.getProduct(productId), [productId], {
    immediate: !!productId
  });
};

export const useCategories = () => {
  return useApi(() => apiService.getCategories(), []);
};

export const useBrands = () => {
  return useApi(() => apiService.getBrands(), []);
};

// 客户相关hooks
export const useCustomers = (params = {}) => {
  return useApi(() => apiService.getCustomers(params), [JSON.stringify(params)]);
};

export const useCustomer = (customerId) => {
  return useApi(() => apiService.getCustomer(customerId), [customerId], {
    immediate: !!customerId
  });
};

export const useCustomerOrders = (customerId, params = {}) => {
  return useApi(() => apiService.getCustomerOrders(customerId, params), [customerId, JSON.stringify(params)], {
    immediate: !!customerId
  });
};

export const useCustomerStats = () => {
  return useApi(() => apiService.getCustomerStats(), []);
};

// 仪表板相关hooks
export const useDashboardStats = () => {
  return useApi(() => apiService.getDashboardStats(), []);
};

export const useSalesData = (period = '30d') => {
  return useApi(() => apiService.getSalesData(period), [period]);
};

export const useRecentOrders = (limit = 10) => {
  return useApi(() => apiService.getRecentOrders(limit), [limit]);
};

export const useBestSellingProducts = (limit = 5) => {
  return useApi(() => apiService.getBestSellingProducts(limit), [limit]);
};

export const useRevenueTrends = (period = '7d') => {
  return useApi(() => apiService.getRevenueTrends(period), [period]);
};

// 设置相关hooks
export const useSystemSettings = () => {
  return useApi(() => apiService.getSystemSettings(), []);
};

export const useNotificationSettings = () => {
  return useApi(() => apiService.getNotificationSettings(), []);
};

export const useNotifications = (params = {}) => {
  return useApi(() => apiService.getNotifications(params), [JSON.stringify(params)]);
};

// 报表相关hooks
export const useSalesReport = (params = {}) => {
  return useApi(() => apiService.getSalesReport(params), [JSON.stringify(params)], {
    immediate: false
  });
};

export const useProductReport = (params = {}) => {
  return useApi(() => apiService.getProductReport(params), [JSON.stringify(params)], {
    immediate: false
  });
};

export const useCustomerReport = (params = {}) => {
  return useApi(() => apiService.getCustomerReport(params), [JSON.stringify(params)], {
    immediate: false
  });
};

export const useInventoryReport = () => {
  return useApi(() => apiService.getInventoryReport(), [], {
    immediate: false
  });
};

// 变更操作hooks
export const useMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (apiCall, ...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(...args);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
};

// 分页hook
export const usePagination = (initialPage = 1, initialPageSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const goToPage = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const goToNextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const goToPrevPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  const changePageSize = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPage(1); // 重置到第一页
  }, []);

  return {
    page,
    pageSize,
    goToPage,
    goToNextPage,
    goToPrevPage,
    changePageSize,
    reset: () => {
      setPage(initialPage);
      setPageSize(initialPageSize);
    }
  };
};

// 搜索和筛选hook
export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const clearFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    clearFilter
  };
}; 
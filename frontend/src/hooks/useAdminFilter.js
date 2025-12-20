import { useState, useCallback, useMemo } from 'react';

export const useAdminFilter = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('DESC');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  }, []);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setPage(0); // Reset to first page when search changes
  }, []);

  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortDir('ASC');
    }
    setPage(0); // Reset to first page when sort changes
  }, [sortBy, sortDir]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleSizeChange = useCallback((newSize) => {
    setSize(newSize);
    setPage(0); // Reset to first page when size changes
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchTerm('');
    setSortBy('id');
    setSortDir('DESC');
    setPage(0);
  }, [initialFilters]);

  // Build query parameters for API calls
  const queryParams = useMemo(() => {
    const params = {
      page,
      size,
      sortBy,
      sortDir,
    };

    // Add search term
    if (searchTerm.trim()) {
      params.keyword = searchTerm.trim();
    }

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        if (key === 'dateRange' && value.from && value.to) {
          params.fromDate = value.from;
          params.toDate = value.to;
        } else {
          params[key] = value;
        }
      }
    });

    return params;
  }, [filters, searchTerm, sortBy, sortDir, page, size]);

  // Build URL search params string
  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params.append(key, value.toString());
      }
    });
    return params.toString();
  }, [queryParams]);

  return {
    // State
    filters,
    searchTerm,
    sortBy,
    sortDir,
    page,
    size,
    
    // Handlers
    handleFilterChange,
    handleSearch,
    handleSort,
    handlePageChange,
    handleSizeChange,
    resetFilters,
    
    // Computed
    queryParams,
    searchParams,
    
    // Setters (for direct control if needed)
    setFilters,
    setSearchTerm,
    setSortBy,
    setSortDir,
    setPage,
    setSize,
  };
};
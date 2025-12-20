import { useState, useEffect } from 'react';
import { FaFilter, FaSearch, FaTimes, FaCalendarAlt } from 'react-icons/fa';

const AdminFilter = ({ 
  filters = [], 
  onFilterChange, 
  onSearch, 
  searchPlaceholder = "Tìm kiếm...",
  showDateRange = false,
  showExport = false,
  onExport
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    // Initialize filter values
    const initialValues = {};
    filters.forEach(filter => {
      initialValues[filter.key] = filter.defaultValue || '';
    });
    setFilterValues(initialValues);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    const newValues = { ...filterValues, [key]: value };
    setFilterValues(newValues);
    onFilterChange && onFilterChange(newValues);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch && onSearch(searchTerm);
  };

  const handleDateRangeChange = (field, value) => {
    const newRange = { ...dateRange, [field]: value };
    setDateRange(newRange);
    onFilterChange && onFilterChange({ ...filterValues, dateRange: newRange });
  };

  const clearFilters = () => {
    const clearedValues = {};
    filters.forEach(filter => {
      clearedValues[filter.key] = '';
    });
    setFilterValues(clearedValues);
    setSearchTerm('');
    setDateRange({ from: '', to: '' });
    onFilterChange && onFilterChange(clearedValues);
    onSearch && onSearch('');
  };

  const hasActiveFilters = Object.values(filterValues).some(value => value !== '') || 
                          searchTerm !== '' || 
                          dateRange.from !== '' || 
                          dateRange.to !== '';

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <FaFilter className="text-blue-600" />
          <h3 className="font-semibold text-gray-800">Bộ Lọc & Tìm Kiếm</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
              Đang lọc
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showExport && (
            <button
              onClick={onExport}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition"
            >
              Xuất Excel
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              isOpen 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isOpen ? 'Thu gọn' : 'Mở rộng'}
          </button>
        </div>
      </div>

      {/* Search Bar - Always visible */}
      <div className="p-4 border-b border-gray-100">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition"
          >
            Tìm
          </button>
        </form>
      </div>

      {/* Filters - Collapsible */}
      {isOpen && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Date Range Filter */}
            {showDateRange && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaCalendarAlt className="inline mr-1" />
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => handleDateRangeChange('from', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaCalendarAlt className="inline mr-1" />
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => handleDateRangeChange('to', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {/* Dynamic Filters */}
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filter.label}
                </label>
                {filter.type === 'select' ? (
                  <select
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Tất cả --</option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : filter.type === 'number' ? (
                  <input
                    type="number"
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    placeholder={filter.placeholder}
                    min={filter.min}
                    max={filter.max}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : filter.type === 'range' ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={filterValues[`${filter.key}_min`] || ''}
                      onChange={(e) => handleFilterChange(`${filter.key}_min`, e.target.value)}
                      placeholder="Từ"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={filterValues[`${filter.key}_max`] || ''}
                      onChange={(e) => handleFilterChange(`${filter.key}_max`, e.target.value)}
                      placeholder="Đến"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    placeholder={filter.placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <FaTimes />
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminFilter;
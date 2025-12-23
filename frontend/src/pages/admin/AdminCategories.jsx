import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { categoryService } from '../../services';
import { useApp } from '../../context/AppContext';
import ImageUploader from '../../components/ui/ImageUploader';

const AdminCategories = () => {
  const { addNotification } = useApp();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAllCategories();
      setCategories(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form submitted with data:', formData); // Debug log

    if (!formData.name.trim()) {
      setError('Tên danh mục không được để trống');
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: 'Tên danh mục không được để trống'
      });
      return;
    }

    try {
      if (editingId) {
        console.log('Updating category:', editingId, formData); // Debug log
        await categoryService.updateCategory(editingId, formData);
        addNotification({
          type: 'success',
          title: 'Thành công',
          message: 'Cập nhật danh mục thành công'
        });
      } else {
        console.log('Creating category:', formData); // Debug log
        await categoryService.createCategory(formData);
        addNotification({
          type: 'success',
          title: 'Thành công',
          message: 'Thêm danh mục mới thành công'
        });
      }

      resetForm();
      fetchCategories();
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err.message || 'Có lỗi xảy ra';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: errorMessage
      });
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description,
      image: category.image || '',
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa?')) {
      try {
        await categoryService.deleteCategory(id);
        addNotification({
          type: 'success',
          title: 'Thành công',
          message: 'Xóa danh mục thành công'
        });
        fetchCategories();
      } catch (err) {
        console.error('Error:', err);
        addNotification({
          type: 'error',
          title: 'Lỗi',
          message: err.message || 'Có lỗi xảy ra khi xóa'
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', image: '' });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Danh Mục</h1>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <FaPlus /> {showForm ? 'Hủy' : 'Thêm Danh Mục'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            {editingId ? 'Cập Nhật Danh Mục' : 'Thêm Danh Mục Mới'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên Danh Mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  console.log('Name changed:', e.target.value); // Debug log
                  setFormData({ ...formData, name: e.target.value });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Nhập tên danh mục"
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô Tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  console.log('Description changed:', e.target.value); // Debug log
                  setFormData({ ...formData, description: e.target.value });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-vertical"
                placeholder="Nhập mô tả"
                rows="3"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hình Ảnh Danh Mục
              </label>
              <ImageUploader
                images={formData.image ? [formData.image] : []}
                onImagesChange={(newImages) => setFormData({ ...formData, image: newImages[0] || '' })}
                folder="categories"
                multiple={false}
                maxImages={1}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                {editingId ? 'Cập Nhật' : 'Thêm'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ảnh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mô Tả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {category.id}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {category.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {categories.length === 0 && (
              <div className="text-center py-8 text-gray-600">
                Không có danh mục nào
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;

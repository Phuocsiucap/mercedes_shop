import { useState, useRef } from 'react';
import { FaUpload, FaDownload, FaTimes, FaFileExcel, FaFileCsv } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const ImportModal = ({ 
  isOpen, 
  onClose, 
  onImport, 
  title = "Import Dữ Liệu",
  templateColumns = [],
  sampleData = []
}) => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState([]);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const fileType = selectedFile.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileType)) {
      setError('Chỉ hỗ trợ file Excel (.xlsx, .xls) và CSV (.csv)');
      return;
    }

    setFile(selectedFile);
    setError('');
    parseFile(selectedFile);
  };

  const parseFile = (file) => {
    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        let workbook;

        if (file.name.endsWith('.csv')) {
          // Parse CSV
          workbook = XLSX.read(data, { type: 'string' });
        } else {
          // Parse Excel
          workbook = XLSX.read(data, { type: 'array' });
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
          setError('File không có dữ liệu');
          setLoading(false);
          return;
        }

        // Lấy header (dòng đầu tiên)
        const headers = jsonData[0];
        
        // Chuyển đổi dữ liệu thành object
        const parsedData = jsonData.slice(1).map((row, index) => {
          const obj = { _rowIndex: index + 2 }; // +2 vì bỏ header và index bắt đầu từ 1
          headers.forEach((header, colIndex) => {
            obj[header] = row[colIndex] || '';
          });
          return obj;
        }).filter(row => {
          // Lọc bỏ dòng trống
          return Object.values(row).some(value => value !== '' && value !== undefined && value !== null);
        });

        setData(parsedData);
        setPreview(parsedData.slice(0, 5)); // Hiển thị 5 dòng đầu
        setLoading(false);
      } catch (err) {
        console.error('Error parsing file:', err);
        setError('Lỗi khi đọc file. Vui lòng kiểm tra định dạng file.');
        setLoading(false);
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleImport = async () => {
    if (!data.length) {
      setError('Không có dữ liệu để import');
      return;
    }

    setLoading(true);
    try {
      await onImport(data);
      handleClose();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi import dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setData([]);
    setPreview([]);
    setError('');
    setLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const downloadTemplate = () => {
    if (!templateColumns.length) return;

    const ws = XLSX.utils.aoa_to_sheet([
      templateColumns,
      ...sampleData
    ]);
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    
    XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_Template.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaUpload className="text-blue-600" />
            {title}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-800 text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Template Download */}
          {templateColumns.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">📋 Template File</h3>
              <p className="text-sm text-blue-700 mb-3">
                Tải xuống file mẫu để đảm bảo định dạng dữ liệu chính xác
              </p>
              
              {/* Quick Guide */}
              <div className="mb-3 p-3 bg-white rounded border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">📝 Hướng dẫn nhanh:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Bắt buộc:</strong> Tên xe, Danh mục, Giá</li>
                  <li>• <strong>Giá:</strong> Nhập số nguyên (VD: 1500000000)</li>
                  <li>• <strong>Danh mục:</strong> Sedan, SUV, Hatchback, Coupe, Convertible, Wagon</li>
                  <li>• <strong>Năm:</strong> 1900 - {new Date().getFullYear() + 1}</li>
                  <li>• <strong>Chỗ ngồi:</strong> 1-50</li>
                  <li>• <strong>URL Ảnh:</strong> Nhiều URL cách nhau bằng dấu phẩy</li>
                </ul>
              </div>
              
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                <FaDownload />
                Tải Template Excel
              </button>
            </div>
          )}

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chọn File Import
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-4 text-3xl text-gray-400">
                    <FaFileExcel className="text-green-600" />
                    <FaFileCsv className="text-blue-600" />
                  </div>
                  <p className="text-gray-600">
                    Nhấn để chọn file hoặc kéo thả file vào đây
                  </p>
                  <p className="text-sm text-gray-500">
                    Hỗ trợ: .xlsx, .xls, .csv
                  </p>
                </div>
              </label>
            </div>
            
            {file && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>File đã chọn:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="mb-4 flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang xử lý...</span>
            </div>
          )}

          {/* Data Preview */}
          {preview.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                📊 Xem Trước Dữ Liệu ({data.length} dòng)
              </h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {preview[0] && Object.keys(preview[0]).filter(key => key !== '_rowIndex').map(key => (
                        <th key={key} className="px-4 py-2 text-left font-semibold text-gray-700 border-b">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {Object.keys(row).filter(key => key !== '_rowIndex').map(key => (
                          <td key={key} className="px-4 py-2 border-b border-gray-100">
                            {String(row[key] || '').substring(0, 50)}
                            {String(row[key] || '').length > 50 && '...'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.length > 5 && (
                <p className="text-sm text-gray-500 mt-2">
                  ... và {data.length - 5} dòng khác
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition"
          >
            Hủy
          </button>
          <button
            onClick={handleImport}
            disabled={!data.length || loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Đang Import...
              </>
            ) : (
              <>
                <FaUpload />
                Import ({data.length} dòng)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
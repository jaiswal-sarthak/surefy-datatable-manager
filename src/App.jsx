import React, { useState, useMemo } from 'react';
import { Settings, Upload, Download, Edit2, Trash2, Check, X, Plus, Moon, Sun, ChevronUp, ChevronDown } from 'lucide-react';

const defaultColumns = [
  { id: 'name', label: 'Name', visible: true },
  { id: 'email', label: 'Email', visible: true },
  { id: 'age', label: 'Age', visible: true },
  { id: 'role', label: 'Role', visible: true },
];

const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', age: 28, role: 'Developer' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 32, role: 'Designer' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 45, role: 'Manager' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', age: 29, role: 'Developer' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', age: 35, role: 'Analyst' },
  { id: 6, name: 'Eva Martinez', email: 'eva@example.com', age: 27, role: 'Developer' },
  { id: 7, name: 'David Lee', email: 'david@example.com', age: 38, role: 'Manager' },
  { id: 8, name: 'Sarah Connor', email: 'sarah@example.com', age: 31, role: 'Designer' },
  { id: 9, name: 'Mike Ross', email: 'mike@example.com', age: 26, role: 'Analyst' },
  { id: 10, name: 'Rachel Green', email: 'rachel@example.com', age: 33, role: 'Designer' },
  { id: 11, name: 'Tom Hardy', email: 'tom@example.com', age: 42, role: 'Manager' },
  { id: 12, name: 'Emma Stone', email: 'emma@example.com', age: 30, role: 'Developer' },
];

export default function DataTableManager() {
  const [data, setData] = useState(sampleData);
  const [columns, setColumns] = useState(defaultColumns);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [openColumns, setOpenColumns] = useState(false);
  const [newColumn, setNewColumn] = useState({ id: '', label: '' });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showAddRow, setShowAddRow] = useState(false);
  const [newRow, setNewRow] = useState({ name: '', email: '', age: '', role: '' });
  const [validationErrors, setValidationErrors] = useState({});

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const validateField = (field, value) => {
    const errors = {};
    
    switch (field) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Name is required';
        } else if (/[0-9]/.test(value)) {
          errors.name = 'Name cannot contain numbers';
        }
        break;
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address';
        }
        break;
      case 'age':
        if (!value) {
          errors.age = 'Age is required';
        } else if (isNaN(value) || parseInt(value) <= 0) {
          errors.age = 'Age must be a positive number';
        } else if (parseInt(value) > 150) {
          errors.age = 'Age must be reasonable';
        }
        break;
      case 'role':
        if (!value.trim()) {
          errors.role = 'Role is required';
        }
        break;
      default:
        break;
    }
    
    return errors;
  };

  const validateAllFields = (rowData) => {
    const errors = {};
    
    Object.keys(rowData).forEach(field => {
      const fieldErrors = validateField(field, rowData[field]);
      Object.assign(errors, fieldErrors);
    });
    
    return errors;
  };

  const filteredData = useMemo(() => {
    return data.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search]);

  const sortedData = useMemo(() => {
    if (!orderBy) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[orderBy] || '';
      const bVal = b[orderBy] || '';
      const compare = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return order === 'asc' ? compare : -compare;
    });
  }, [filteredData, orderBy, order]);

  const paginatedData = sortedData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this row?')) {
      setData(data.filter(row => row.id !== id));
      showNotification('Row deleted successfully');
    }
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditData({ ...row });
    setValidationErrors({});
  };

  const saveEdit = () => {
    const errors = validateAllFields(editData);
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showNotification('Please fix validation errors', 'error');
      return;
    }

    // Convert age to number
    const processedData = {
      ...editData,
      age: parseInt(editData.age)
    };

    setData(data.map(row => row.id === editingId ? processedData : row));
    setEditingId(null);
    setEditData({});
    setValidationErrors({});
    showNotification('Changes saved successfully');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
    setValidationErrors({});
  };

  const toggleColumn = (columnId) => {
    setColumns(columns.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const addColumn = () => {
    if (!newColumn.id || !newColumn.label) {
      showNotification('Please fill all fields', 'error');
      return;
    }
    if (columns.some(col => col.id === newColumn.id)) {
      showNotification('Column ID already exists', 'error');
      return;
    }
    setColumns([...columns, { ...newColumn, visible: true }]);
    setNewColumn({ id: '', label: '' });
    showNotification('Column added successfully');
  };

  const handleAddRow = () => {
    const errors = validateAllFields(newRow);
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showNotification('Please fix validation errors', 'error');
      return;
    }

    const newRowData = {
      id: Math.max(...data.map(row => row.id)) + 1,
      name: newRow.name.trim(),
      email: newRow.email.trim(),
      age: parseInt(newRow.age),
      role: newRow.role.trim()
    };

    setData([...data, newRowData]);
    setNewRow({ name: '', email: '', age: '', role: '' });
    setShowAddRow(false);
    setValidationErrors({});
    showNotification('Row added successfully');
  };

  const cancelAddRow = () => {
    setShowAddRow(false);
    setNewRow({ name: '', email: '', age: '', role: '' });
    setValidationErrors({});
  };

  const handleNewRowChange = (field, value) => {
    setNewRow(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleEditDataChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const imported = lines.slice(1).map((line, i) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row = { id: data.length + i + 1 };
          headers.forEach((header, idx) => {
            row[header.toLowerCase()] = values[idx] || '';
          });
          return row;
        });
        setData([...data, ...imported]);
        showNotification(`Imported ${imported.length} rows successfully`);
      } catch (err) {
        showNotification('Error parsing CSV file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExport = () => {
    const visibleCols = columns.filter(col => col.visible);
    const headers = visibleCols.map(col => col.label).join(',');
    const rows = data.map(row =>
      visibleCols.map(col => `"${row[col.id] || ''}"`).join(',')
    ).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table-data.csv';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully');
  };

  const visibleColumns = columns.filter(col => col.visible);
  const bgColor = darkMode ? '#1a202c' : '#f7fafc';
  const cardBg = darkMode ? '#2d3748' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#1a202c';
  const borderColor = darkMode ? '#4a5568' : '#e2e8f0';
  const errorColor = '#ef4444';

  return (
    <div style={{ minHeight: '100vh', background: bgColor, color: textColor, padding: '24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', margin: 0 }}>📊 Data Table Manager</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: cardBg,
              border: `1px solid ${borderColor}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Search all fields..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '10px 16px',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              background: cardBg,
              color: textColor,
              fontSize: '14px'
            }}
          />
          <button
            onClick={() => setShowAddRow(true)}
            style={{
              padding: '10px 16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Plus size={18} />
            Add Row
          </button>
          <button
            onClick={() => setOpenColumns(true)}
            style={{
              padding: '10px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Settings size={18} />
            Manage Columns
          </button>
          <label style={{
            padding: '10px 16px',
            background: '#f59e0b',
            color: 'white',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <Upload size={18} />
            Import CSV
            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
          </label>
          <button
            onClick={handleExport}
            style={{
              padding: '10px 16px',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        {/* Add Row Form */}
        {showAddRow && (
          <div style={{
            background: cardBg,
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px',
            border: `1px solid ${borderColor}`,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Add New Row</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Name *</label>
                <input
                  type="text"
                  value={newRow.name}
                  onChange={(e) => handleNewRowChange('name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${validationErrors.name ? errorColor : borderColor}`,
                    background: darkMode ? '#1a202c' : '#ffffff',
                    color: textColor,
                    fontSize: '14px'
                  }}
                  placeholder="Enter name"
                />
                {validationErrors.name && (
                  <div style={{ color: errorColor, fontSize: '12px', marginTop: '4px' }}>{validationErrors.name}</div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Email *</label>
                <input
                  type="email"
                  value={newRow.email}
                  onChange={(e) => handleNewRowChange('email', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${validationErrors.email ? errorColor : borderColor}`,
                    background: darkMode ? '#1a202c' : '#ffffff',
                    color: textColor,
                    fontSize: '14px'
                  }}
                  placeholder="Enter email"
                />
                {validationErrors.email && (
                  <div style={{ color: errorColor, fontSize: '12px', marginTop: '4px' }}>{validationErrors.email}</div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Age *</label>
                <input
                  type="number"
                  value={newRow.age}
                  onChange={(e) => handleNewRowChange('age', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${validationErrors.age ? errorColor : borderColor}`,
                    background: darkMode ? '#1a202c' : '#ffffff',
                    color: textColor,
                    fontSize: '14px'
                  }}
                  placeholder="Enter age"
                  min="1"
                  max="150"
                />
                {validationErrors.age && (
                  <div style={{ color: errorColor, fontSize: '12px', marginTop: '4px' }}>{validationErrors.age}</div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Role *</label>
                <input
                  type="text"
                  value={newRow.role}
                  onChange={(e) => handleNewRowChange('role', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${validationErrors.role ? errorColor : borderColor}`,
                    background: darkMode ? '#1a202c' : '#ffffff',
                    color: textColor,
                    fontSize: '14px'
                  }}
                  placeholder="Enter role"
                />
                {validationErrors.role && (
                  <div style={{ color: errorColor, fontSize: '12px', marginTop: '4px' }}>{validationErrors.role}</div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={cancelAddRow}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  color: textColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddRow}
                style={{
                  padding: '8px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Add Row
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div style={{ background: cardBg, borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: darkMode ? '#374151' : '#f3f4f6' }}>
                <tr>
                  {visibleColumns.map(col => (
                    <th key={col.id} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>
                      <button
                        onClick={() => handleSort(col.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: textColor,
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        {col.label}
                        {orderBy === col.id && (
                          order === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </button>
                    </th>
                  ))}
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row) => (
                  <tr
                    key={row.id}
                    onDoubleClick={() => startEdit(row)}
                    style={{
                      borderTop: `1px solid ${borderColor}`,
                      cursor: 'pointer'
                    }}
                  >
                    {visibleColumns.map(col => (
                      <td key={col.id} style={{ padding: '12px 16px' }}>
                        {editingId === row.id ? (
                          <div>
                            <input
                              type={col.id === 'age' ? 'number' : 'text'}
                              value={editData[col.id] || ''}
                              onChange={(e) => handleEditDataChange(col.id, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '6px 8px',
                                borderRadius: '4px',
                                border: `1px solid ${validationErrors[col.id] ? errorColor : borderColor}`,
                                background: darkMode ? '#1a202c' : '#ffffff',
                                color: textColor
                              }}
                            />
                            {validationErrors[col.id] && (
                              <div style={{ color: errorColor, fontSize: '11px', marginTop: '4px' }}>
                                {validationErrors[col.id]}
                              </div>
                            )}
                          </div>
                        ) : (
                          row[col.id]
                        )}
                      </td>
                    ))}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {editingId === row.id ? (
                          <>
                            <button
                              onClick={saveEdit}
                              style={{
                                padding: '4px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#10b981'
                              }}
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              style={{
                                padding: '4px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#ef4444'
                              }}
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(row)}
                              style={{
                                padding: '4px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#3b82f6'
                              }}
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(row.id)}
                              style={{
                                padding: '4px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#ef4444'
                              }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {paginatedData.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: textColor }}>
              <div style={{ fontSize: '16px', opacity: 0.7 }}>No data found</div>
            </div>
          )}

          {/* Pagination */}
          <div style={{
            padding: '12px 16px',
            borderTop: `1px solid ${borderColor}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ fontSize: '14px' }}>
              Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, sortedData.length)} of {sortedData.length} entries
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: page === 0 ? 'not-allowed' : 'pointer',
                  background: page === 0 ? '#d1d5db' : '#3b82f6',
                  color: page === 0 ? '#6b7280' : 'white',
                  fontSize: '14px'
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: '14px' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                  background: page >= totalPages - 1 ? '#d1d5db' : '#3b82f6',
                  color: page >= totalPages - 1 ? '#6b7280' : 'white',
                  fontSize: '14px'
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          padding: '16px',
          color: darkMode ? '#9ca3af' : '#6b7280',
          fontSize: '14px',
          borderTop: `1px solid ${borderColor}`
        }}>
          Built with ❤️ by Sarthak Jaiswal
        </div>

        {/* Column Management Modal */}
        {openColumns && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}>
            <div style={{
              background: cardBg,
              borderRadius: '8px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
            }}>
              <div style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', marginTop: 0 }}>Manage Columns</h2>
                
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontWeight: '600', marginBottom: '12px', fontSize: '16px' }}>Toggle Column Visibility</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {columns.map(col => (
                      <label key={col.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '4px'
                      }}>
                        <input
                          type="checkbox"
                          checked={col.visible}
                          onChange={() => toggleColumn(col.id)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{
                  borderTop: `1px solid ${borderColor}`,
                  paddingTop: '16px'
                }}>
                  <h3 style={{ fontWeight: '600', marginBottom: '12px', fontSize: '16px' }}>Add New Column</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                      type="text"
                      placeholder="Field ID (e.g., department)"
                      value={newColumn.id}
                      onChange={(e) => setNewColumn({ ...newColumn, id: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${borderColor}`,
                        background: darkMode ? '#1a202c' : '#ffffff',
                        color: textColor,
                        fontSize: '14px'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Label (e.g., Department)"
                      value={newColumn.label}
                      onChange={(e) => setNewColumn({ ...newColumn, label: e.target.value })}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${borderColor}`,
                        background: darkMode ? '#1a202c' : '#ffffff',
                        color: textColor,
                        fontSize: '14px'
                      }}
                    />
                    <button
                      onClick={addColumn}
                      style={{
                        padding: '10px 16px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      <Plus size={18} />
                      Add Column
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setOpenColumns(false)}
                  style={{
                    marginTop: '24px',
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: darkMode ? '#374151' : '#e5e7eb',
                    color: textColor,
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification.show && (
          <div style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            zIndex: 1000,
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{
              padding: '12px 24px',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: notification.type === 'success' ? '#10b981' : '#ef4444',
              color: 'white',
              fontWeight: '500'
            }}>
              {notification.type === 'success' ? <Check size={20} /> : <X size={20} />}
              <span>{notification.message}</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
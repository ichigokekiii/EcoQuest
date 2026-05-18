import { useEffect, useMemo, useState } from 'react';

import Header from '../components/Header';
import PageStatRow from '../components/PageStatRow';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import TableToolbar from '../components/TableToolbar';
import api from '../services/api';

const emptyCategoryForm = {
  id: '',
  name: '',
  description: '',
  examplesText: 'plastic bottle\nfood wrapper',
  rulesText: 'Classify as this category when the item is mostly made of this material.',
  status: 'active',
};

function buildCategoryForm(category) {
  return {
    id: category.id || '',
    name: category.name || '',
    description: category.description || '',
    examplesText: (category.examples || []).join('\n'),
    rulesText: (category.rules || []).join('\n'),
    status: category.status || 'active',
  };
}

function parseLines(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function CategoryForm({ editingCategoryId, form, onCancel, onChange, onSubmit, saving }) {
  return (
    <section className="data-card page-form-card collapsible-form">
      <div className="section-head">
        <div>
          <h2>{editingCategoryId ? 'Edit Trash Category' : 'Create Trash Category'}</h2>
          <p>Official categories used by mobile trash submission and AI classification.</p>
        </div>
        <button className="outline-action" onClick={onCancel} type="button">
          Close
        </button>
      </div>

      <form className="form-grid" onSubmit={onSubmit}>
        {!editingCategoryId ? (
          <label className="field">
            <span>Category ID</span>
            <input name="id" onChange={onChange} placeholder="plastic" value={form.id} />
          </label>
        ) : null}

        <label className="field">
          <span>Name</span>
          <input name="name" onChange={onChange} required value={form.name} />
        </label>

        <label className="field">
          <span>Status</span>
          <select name="status" onChange={onChange} value={form.status}>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        <label className="field wide">
          <span>Description</span>
          <textarea name="description" onChange={onChange} value={form.description} />
        </label>

        <label className="field wide">
          <span>Examples (one per line)</span>
          <textarea name="examplesText" onChange={onChange} rows={4} value={form.examplesText} />
        </label>

        <label className="field wide">
          <span>Rules (one per line)</span>
          <textarea name="rulesText" onChange={onChange} rows={4} value={form.rulesText} />
        </label>

        <div className="form-actions">
          <button className="filled-action" disabled={saving} type="submit">
            {saving ? 'Saving...' : editingCategoryId ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default function TrashCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadCategories() {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await api.get('/admin/trash-categories?limit=50');
      setCategories(response.data.categories || []);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to load trash categories.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      `${category.name || ''} ${category.description || ''} ${category.id || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setCategoryForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleSubmitCategory(event) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    const payload = {
      id: categoryForm.id,
      name: categoryForm.name,
      description: categoryForm.description,
      examples: parseLines(categoryForm.examplesText),
      rules: parseLines(categoryForm.rulesText),
      status: categoryForm.status,
    };

    try {
      const response = editingCategoryId
        ? await api.patch(`/admin/trash-categories/${editingCategoryId}`, payload)
        : await api.post('/admin/trash-categories', payload);

      setCategories((currentCategories) => [
        response.data.category,
        ...currentCategories.filter((category) => category.id !== response.data.category.id),
      ]);
      setCategoryForm(emptyCategoryForm);
      setEditingCategoryId(null);
      setShowForm(false);
      setSuccessMessage(
        editingCategoryId ? 'Category updated successfully.' : 'Category created successfully.'
      );
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to save category.');
    } finally {
      setSaving(false);
    }
  }

  function handleEditCategory(category) {
    setEditingCategoryId(category.id);
    setCategoryForm(buildCategoryForm(category));
    setShowForm(true);
  }

  async function handleArchiveCategory(category) {
    try {
      const response = await api.patch(`/admin/trash-categories/${category.id}`, {
        status: 'archived',
      });
      setCategories((currentCategories) =>
        currentCategories.map((item) => (item.id === category.id ? response.data.category : item))
      );
      setSuccessMessage(`${category.name} archived.`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to archive category.');
    }
  }

  return (
    <section className="categories-page">
      <Header
        actions={
          <button
            className="filled-action"
            onClick={() => {
              setEditingCategoryId(null);
              setCategoryForm(emptyCategoryForm);
              setShowForm(true);
            }}
            type="button"
          >
            + New Category
          </button>
        }
        subtitle={`${categories.filter((category) => category.status === 'active').length} active categories`}
        title="Trash Categories"
      />

      {errorMessage ? <p className="error">{errorMessage}</p> : null}
      {successMessage ? <p className="success">{successMessage}</p> : null}

      {showForm ? (
        <CategoryForm
          editingCategoryId={editingCategoryId}
          form={categoryForm}
          onCancel={() => {
            setShowForm(false);
            setEditingCategoryId(null);
            setCategoryForm(emptyCategoryForm);
          }}
          onChange={handleFormChange}
          onSubmit={handleSubmitCategory}
          saving={saving}
        />
      ) : null}

      <PageStatRow>
        <StatCard label="Total Categories" tone="blue" value={categories.length} />
        <StatCard
          label="Active"
          tone="green"
          value={categories.filter((category) => category.status === 'active').length}
        />
        <StatCard
          label="Archived"
          tone="yellow"
          value={categories.filter((category) => category.status === 'archived').length}
        />
      </PageStatRow>

      <section className="data-card">
        <TableToolbar
          onSearchChange={(event) => setSearchQuery(event.target.value)}
          searchPlaceholder="Search categories..."
          searchValue={searchQuery}
        />

        {loading ? (
          <p className="loading-state">Loading categories...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Examples</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <strong>{category.name}</strong>
                    <p className="muted">{category.description}</p>
                  </td>
                  <td>{category.id}</td>
                  <td>{(category.examples || []).slice(0, 2).join(', ') || '—'}</td>
                  <td>
                    <StatusBadge status={category.status || 'active'} />
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="outline-action" onClick={() => handleEditCategory(category)} type="button">
                        Edit
                      </button>
                      <button className="outline-action" onClick={() => handleArchiveCategory(category)} type="button">
                        Archive
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </section>
  );
}

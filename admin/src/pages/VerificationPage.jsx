import { useEffect, useMemo, useState } from 'react';

import Header from '../components/Header';
import api from '../services/api';

const filters = ['All', 'Pending', 'Approved', 'Rejected'];

function formatTimestamp(value) {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleString();
}

function formatConfidence(value) {
  return value == null ? 'Manual only' : `${Math.round(value * 100)}% confidence`;
}

export default function VerificationPage() {
  const [submissions, setSubmissions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadSubmissions() {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await api.get('/admin/trash-submissions?limit=100');
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to load trash submissions.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubmissions();
  }, []);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const status = submission.status || 'pending';
      const searchText = [
        submission.routeName,
        submission.userName,
        submission.finalCategoryName,
        submission.aiSuggestedCategoryName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesFilter =
        activeFilter === 'All' || status.toLowerCase().includes(activeFilter.toLowerCase());
      const matchesSearch = searchText.includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery, submissions]);

  async function handleReview(submission, status) {
    try {
      const response = await api.patch(`/admin/trash-submissions/${submission.id}`, { status });
      setSubmissions((currentSubmissions) =>
        currentSubmissions.map((item) =>
          item.id === submission.id ? response.data.submission : item
        )
      );
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to update submission.');
    }
  }

  return (
    <section className="verification-page">
      <Header
        title="Trash Photo Reviews"
        subtitle={`${submissions.length} submissions in queue`}
        searchPlaceholder="Search submissions..."
        searchValue={searchQuery}
        onSearchChange={(event) => setSearchQuery(event.target.value)}
        actions={
          <button className="outline-action" onClick={loadSubmissions} type="button">
            Refresh
          </button>
        }
      />

      <section className="verification-filters">
        {filters.map((filter) => (
          <button
            className={`filter-pill${activeFilter === filter ? ' active' : ''}`}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </section>

      {errorMessage ? <p className="error">{errorMessage}</p> : null}

      {loading ? (
        <p className="loading-state">Loading verification queue...</p>
      ) : (
        <section className="verification-grid">
          {filteredSubmissions.map((submission) => (
            <article className="verification-card" key={submission.id}>
              <div
                className="verification-card-image"
                style={
                  submission.photoUrl || submission.imageUrl || submission.imageUri
                    ? {
                        backgroundImage: `url(${
                          submission.photoUrl || submission.imageUrl || submission.imageUri
                        })`,
                      }
                    : undefined
                }
              >
                <span className="submission-id-badge">SUB-{submission.id.slice(-4).toUpperCase()}</span>
                <span className={`status-pill ${submission.status === 'pending' ? 'pending' : submission.status === 'rejected' ? 'rejected' : 'approved'}`}>
                  {submission.status || 'pending'}
                </span>
                <span className="verification-card-time">
                  {formatTimestamp(submission.createdAt)}
                </span>
              </div>
              <div className="verification-card-body">
                <div className="verification-card-info">
                  <div>
                    <p className="submission-name">
                      {submission.userName || submission.userId || 'EcoQuest User'}
                    </p>
                    <p className="submission-route">
                      {submission.routeName || submission.routeId || 'Cleanup Route'}
                    </p>
                  </div>
                  <span className="verification-type">
                    Final: {submission.finalCategoryName || submission.trashCategoryName || 'Trash'}
                  </span>
                </div>

                <p className="muted">
                  AI: <strong>{submission.aiSuggestedCategoryName || 'Not analyzed'}</strong>
                  {' · '}
                  {formatConfidence(submission.aiConfidence)}
                  {submission.categoryChangedByUser ? ' · user changed' : ''}
                </p>

                <p className="muted">
                  Status: <strong>{submission.status || 'pending'}</strong>
                  {submission.aiNeedsReview ? ' · AI needs review' : ''}
                </p>

                <div className="verification-card-actions">
                  <button
                    className="verification-button reject-button"
                    onClick={() => handleReview(submission, 'rejected')}
                    type="button"
                  >
                    Reject
                  </button>
                  <button
                    className="verification-button approve-button"
                    onClick={() => handleReview(submission, 'approved')}
                    type="button"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </article>
          ))}
          {filteredSubmissions.length === 0 ? (
            <p className="empty-state">No submissions match this view.</p>
          ) : null}
        </section>
      )}
    </section>
  );
}

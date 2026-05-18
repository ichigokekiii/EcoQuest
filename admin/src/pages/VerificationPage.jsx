import { useEffect, useMemo, useState } from 'react';

import Header from '../components/Header';
import PageStatRow from '../components/PageStatRow';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

const filters = ['All', 'Pending', 'Approved', 'Rejected'];

function formatTimestamp(value) {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 60) {
    return `${Math.max(diffMinutes, 1)} min ago`;
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function isToday(value) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function getHandle(submission) {
  const handle = submission.userName || submission.userId || 'user';
  return `@${String(handle).replace(/\s+/g, '_').toLowerCase().slice(0, 12)}`;
}

function exportSubmissionsCsv(submissions) {
  const headers = [
    'id',
    'userName',
    'routeName',
    'finalCategoryName',
    'aiSuggestedCategoryName',
    'aiConfidence',
    'status',
    'createdAt',
  ];
  const rows = submissions.map((submission) =>
    headers
      .map((header) => `"${String(submission[header] ?? '').replace(/"/g, '""')}"`)
      .join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ecoquest-trash-submissions.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export default function VerificationPage() {
  const [submissions, setSubmissions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  async function loadSubmissions() {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await api.get('/admin/trash-submissions?limit=50');
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

  const pendingCount = submissions.filter((item) => (item.status || 'pending') === 'pending').length;
  const approvedToday = submissions.filter(
    (item) => item.status === 'approved' && isToday(item.reviewedAt || item.updatedAt)
  ).length;
  const rejectedToday = submissions.filter(
    (item) => item.status === 'rejected' && isToday(item.reviewedAt || item.updatedAt)
  ).length;

  async function handleReview(submission, status) {
    try {
      const response = await api.patch(`/admin/trash-submissions/${submission.id}`, { status });
      setSubmissions((currentSubmissions) =>
        currentSubmissions.map((item) =>
          item.id === submission.id ? response.data.submission : item
        )
      );
      setInfoMessage(`Submission ${status}.`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to update submission.');
    }
  }

  async function handleApproveAllPending() {
    const pendingItems = submissions.filter((item) => (item.status || 'pending') === 'pending');

    if (pendingItems.length === 0) {
      setInfoMessage('No pending submissions to approve.');
      return;
    }

    setInfoMessage('');
    setErrorMessage('');

    try {
      const results = await Promise.all(
        pendingItems.map((item) =>
          api.patch(`/admin/trash-submissions/${item.id}`, { status: 'approved' })
        )
      );

      const approvedById = Object.fromEntries(
        results.map((response) => [response.data.submission.id, response.data.submission])
      );

      setSubmissions((currentSubmissions) =>
        currentSubmissions.map((item) => approvedById[item.id] || item)
      );
      setInfoMessage(`Approved ${pendingItems.length} pending submissions.`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to approve all pending submissions.');
    }
  }

  function handleExportCsv() {
    exportSubmissionsCsv(filteredSubmissions);
    setInfoMessage(`Exported ${filteredSubmissions.length} submissions to CSV.`);
  }

  return (
    <section className="verification-page">
      <Header
        actions={
          <div className="header-action-group">
            <button className="outline-action approve-all-button" onClick={handleApproveAllPending} type="button">
              Approve All Pending
            </button>
            <button className="outline-action" onClick={handleExportCsv} type="button">
              Export CSV
            </button>
          </div>
        }
        searchPlaceholder="Search submissions..."
        searchValue={searchQuery}
        onSearchChange={(event) => setSearchQuery(event.target.value)}
        subtitle={`${pendingCount} pending review${pendingCount === 1 ? '' : 's'}`}
        title="Trash Photo Reviews"
      />

      <PageStatRow>
        <StatCard label="Pending Review" tone="yellow" value={pendingCount} />
        <StatCard label="Approved Today" tone="green" value={approvedToday} />
        <StatCard label="Rejected Today" tone="red" value={rejectedToday} />
      </PageStatRow>

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
      {infoMessage ? <p className="success">{infoMessage}</p> : null}

      {loading ? (
        <p className="loading-state">Loading verification queue...</p>
      ) : (
        <section className="verification-grid">
          {filteredSubmissions.map((submission) => {
            const status = submission.status || 'pending';
            const isPending = status === 'pending';

            return (
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
                  <StatusBadge label={status} status={status} />
                </div>
                <div className="verification-card-body">
                  <div className="verification-card-info">
                    <div>
                      <p className="verification-card-user">{getHandle(submission)}</p>
                      <p className="submission-route">
                        {submission.routeName || submission.routeId || 'Cleanup Route'}
                      </p>
                      <p className="muted">{formatTimestamp(submission.createdAt)}</p>
                      {submission.aiSuggestedCategoryName ? (
                        <p className="verification-ai-line">
                          AI: {submission.aiSuggestedCategoryName}
                          {submission.aiConfidence != null
                            ? ` · ${Math.round(Number(submission.aiConfidence) * 100)}%`
                            : ''}
                        </p>
                      ) : null}
                      <p className="verification-ai-line">
                        Final: {submission.finalCategoryName || submission.trashCategoryName || 'Mixed'}
                      </p>
                    </div>
                    <span className="verification-category-badge">
                      {submission.finalCategoryName || submission.trashCategoryName || 'Mixed'}
                    </span>
                  </div>

                  <div className="verification-card-actions">
                    {isPending ? (
                      <>
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
                      </>
                    ) : (
                      <button
                        className="outline-action"
                        onClick={() => setSelectedSubmission(submission)}
                        type="button"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
          {filteredSubmissions.length === 0 ? (
            <p className="empty-state">No submissions match this view.</p>
          ) : null}
        </section>
      )}

      {selectedSubmission ? (
        <div className="modal-backdrop" role="presentation">
          <section aria-modal="true" className="modal-card" role="dialog">
            <div className="section-head">
              <div>
                <h2>Submission Details</h2>
                <p>{selectedSubmission.routeName}</p>
              </div>
              <button className="outline-action" onClick={() => setSelectedSubmission(null)} type="button">
                Close
              </button>
            </div>
            <p>
              <strong>User:</strong> {selectedSubmission.userName || selectedSubmission.userId}
            </p>
            <p>
              <strong>Status:</strong> {selectedSubmission.status}
            </p>
            <p>
              <strong>Final category:</strong>{' '}
              {selectedSubmission.finalCategoryName || selectedSubmission.trashCategoryName}
            </p>
            {selectedSubmission.aiSuggestedCategoryName ? (
              <p>
                <strong>AI suggestion:</strong> {selectedSubmission.aiSuggestedCategoryName}
              </p>
            ) : null}
            {selectedSubmission.aiReason ? (
              <p>
                <strong>AI reason:</strong> {selectedSubmission.aiReason}
              </p>
            ) : null}
          </section>
        </div>
      ) : null}
    </section>
  );
}

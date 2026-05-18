import Header from "../components/Header";

const verificationItems = [
  {
    name: "Maria Santos",
    location: "Rizal Park Loop",
    type: "PET Bottles",
    timeAgo: "2 hrs ago",
    image:
      "https://images.unsplash.com/photo-1540518614846-fb2d6c4fdadf?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Juan Dela Cruz",
    location: "Baywalk Cleanup",
    type: "Cans",
    timeAgo: "3 hrs ago",
    image:
      "https://images.unsplash.com/photo-1524594154909-9f7e5c684d2c?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Ana Reyes",
    location: "Market District",
    type: "Cardboard",
    timeAgo: "5 hrs ago",
    image:
      "https://images.unsplash.com/photo-1544505407-9d5bdfd4dcc7?auto=format&fit=crop&w=900&q=80",
  },
];

function VerificationCard({ item }) {
  return (
    <article className="verification-card">
      <div
        className="verification-card-image"
        style={{ backgroundImage: `url(${item.image})` }}
      >
        <span className="verification-card-time">{item.timeAgo}</span>
      </div>
      <div className="verification-card-body">
        <div className="verification-card-info">
          <div>
            <p className="verification-user">{item.name}</p>
            <p className="verification-location">{item.location}</p>
          </div>
          <span className="verification-type">{item.type}</span>
        </div>
        <div className="verification-card-actions">
          <button type="button" className="verification-button reject-button">
            Reject
          </button>
          <button type="button" className="verification-button approve-button">
            Approve
          </button>
        </div>
      </div>
    </article>
  );
}

function VerificationPage() {
  return (
    <section className="verification-page">
      <Header
        title="Trash Submission Verification"
        subtitle="Review and validate user-submitted proof of environmental cleanup."
        searchPlaceholder="Search verifications..."
      />

      <section
        className="verification-toolbar"
        aria-label="Verification filters"
      >
        <div className="verification-filters">
          <button type="button" className="dropdown-button">
            All Routes <span>▾</span>
          </button>
          <button type="button" className="dropdown-button">
            Pending <span>▾</span>
          </button>
        </div>
      </section>

      <section
        className="verification-grid"
        aria-label="Verification submissions"
      >
        {verificationItems.map((item) => (
          <VerificationCard key={item.name} item={item} />
        ))}
      </section>

      <div className="verification-footer">
        <button type="button" className="load-more-button">
          Load More Submissions <span>▾</span>
        </button>
      </div>
    </section>
  );
}

export default VerificationPage;

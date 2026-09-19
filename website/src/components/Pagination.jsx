export default function Pagination({ page, totalPages, onChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav className="pagination" aria-label="Profiles">
      <button
        type="button"
        className="pagination__btn"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </button>

      <ol className="pagination__list">
        {pages.map((n) => (
          <li key={n}>
            <button
              type="button"
              className={`pagination__num ${page === n ? 'is-active' : ''}`}
              aria-current={page === n ? 'page' : undefined}
              onClick={() => onChange(n)}
            >
              {n}
            </button>
          </li>
        ))}
      </ol>

      <button
        type="button"
        className="pagination__btn"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </nav>
  )
}

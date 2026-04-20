import '../styles/Pagination.css'

function Pagination({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange, totalItems }) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const pageNumbers = []
  const delta = 2 // Number of pages to show on each side of current page
  const maxPages = 7 // Maximum number of page buttons to show

  if (totalPages <= maxPages) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i)
    }
  } else {
    pageNumbers.push(1)
    
    if (currentPage > delta + 2) {
      pageNumbers.push('...')
    }

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      pageNumbers.push(i)
    }

    if (currentPage < totalPages - delta - 1) {
      pageNumbers.push('...')
    }

    pageNumbers.push(totalPages)
  }

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span className="pagination-stats">
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> items
        </span>
        
        <div className="items-per-page">
          <label htmlFor="items-per-page">Items per page:</label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
            className="items-select"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="pagination-controls">
        <button
          className="pagination-btn prev-btn"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          title="Previous page"
        >
          ← Previous
        </button>

        <div className="page-numbers">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                  ...
                </span>
              )
            }

            return (
              <button
                key={page}
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
                title={`Go to page ${page}`}
              >
                {page}
              </button>
            )
          })}
        </div>

        <button
          className="pagination-btn next-btn"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          title="Next page"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

export default Pagination

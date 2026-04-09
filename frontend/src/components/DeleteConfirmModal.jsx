import '../styles/modal-styles.css'

function DeleteConfirmModal({ isOpen, onClose, onConfirm, title = 'Confirm Delete', message = 'Are you sure?' }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p style={{ marginBottom: '16px', color: '#333' }}>
            {message}
          </p>
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            padding: '12px',
            color: '#856404',
            fontSize: '0.9rem'
          }}>
            ⚠️ This action cannot be undone.
          </div>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn-danger" 
            onClick={onConfirm}
            style={{ background: '#dc3545', color: 'white' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal

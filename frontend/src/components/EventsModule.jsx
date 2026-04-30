import { useState, useEffect } from 'react'
import '../styles/Module.css'
import { eventAPI } from '../services/api'
import DeleteConfirmModal from './DeleteConfirmModal'

function EventsModule({ userData, onLogout }) {
  const userRole = userData?.roles?.[0]?.role_name?.toLowerCase() || 'student'
  const isAdmin = userRole === 'admin' || userRole === 'staff'
  const isStudent = userRole === 'student'

  // Tabs: 'manage' for admin/staff, 'upcoming' for students
  const [activeTab, setActiveTab] = useState(isAdmin ? 'manage' : 'upcoming')
  const [events, setEvents] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [pastEvents, setPastEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Modal states
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)
  const [studentRegistrations, setStudentRegistrations] = useState({})

  // Form state
  const [eventForm, setEventForm] = useState({
    event_name: '',
    event_type: 'Curricular',
    description: '',
    objectives: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    capacity: '',
    event_status: 'Pending',
    requirements: '',
    is_active: true,
  })

  // Filter state
  const [filterType, setFilterType] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError('')

      if (isAdmin) {
        // Admin sees all events
        const response = await eventAPI.getAll()
        if (response.data.success || response.data.data) {
          setEvents(response.data.data || [])
        } else {
          setError('Failed to load events')
        }
      } else {
        // Students see upcoming and past events
        const upcoming = await eventAPI.getUpcoming()
        const past = await eventAPI.getPast()
        if ((upcoming.data.success || upcoming.data.data) && (past.data.success || past.data.data)) {
          setUpcomingEvents(upcoming.data.data || [])
          setPastEvents(past.data.data || [])
        } else {
          setError('Failed to load events')
        }
      }
    } catch (err) {
      console.error('Failed to fetch events:', err)
      setError('Error loading events. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    if (!eventForm.event_name || !eventForm.event_date) {
      setError('Please fill in required fields')
      return
    }

    try {
      const response = await eventAPI.create(eventForm)
      if (response.data.success) {
        setShowEventModal(false)
        setEventForm({
          event_name: '',
          event_type: 'Curricular',
          description: '',
          objectives: '',
          event_date: '',
          start_time: '',
          end_time: '',
          location: '',
          capacity: '',
          event_status: 'Pending',
          requirements: '',
          is_active: true,
        })
        await loadEvents()
        setError('')
      } else {
        setError(response.data.message || 'Failed to create event')
      }
    } catch (err) {
      console.error('Error creating event:', err)
      setError('Error creating event: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleUpdateEvent = async (e) => {
    e.preventDefault()
    if (!eventForm.event_name || !eventForm.event_date) {
      setError('Please fill in required fields')
      return
    }

    try {
      const response = await eventAPI.update(editingEvent.event_id, eventForm)
      if (response.data.success) {
        setShowEventModal(false)
        setEditingEvent(null)
        setEventForm({
          event_name: '',
          event_type: 'Curricular',
          description: '',
          objectives: '',
          event_date: '',
          start_time: '',
          end_time: '',
          location: '',
          capacity: '',
          event_status: 'Pending',
          requirements: '',
          is_active: true,
        })
        await loadEvents()
        setError('')
      } else {
        setError(response.data.message || 'Failed to update event')
      }
    } catch (err) {
      console.error('Error updating event:', err)
      setError('Error updating event: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDeleteEvent = async () => {
    try {
      const response = await eventAPI.delete(eventToDelete.event_id)
      if (response.data.success) {
        setShowDeleteConfirm(false)
        setEventToDelete(null)
        await loadEvents()
        setError('')
      } else {
        setError(response.data.message || 'Failed to delete event')
      }
    } catch (err) {
      console.error('Error deleting event:', err)
      setError('Error deleting event: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleRegisterStudent = async (eventId) => {
    try {
      const response = await eventAPI.registerStudent(eventId, userData.id)
      if (response.data.success) {
        setStudentRegistrations({
          ...studentRegistrations,
          [eventId]: 'registered',
        })
      } else {
        setError(response.data.message || 'Failed to register for event')
      }
    } catch (err) {
      console.error('Error registering for event:', err)
      setError('Error registering: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleUnregisterStudent = async (eventId) => {
    try {
      const response = await eventAPI.unregisterStudent(eventId, userData.id)
      if (response.data.success) {
        setStudentRegistrations({
          ...studentRegistrations,
          [eventId]: 'unregistered',
        })
      } else {
        setError(response.data.message || 'Failed to unregister from event')
      }
    } catch (err) {
      console.error('Error unregistering from event:', err)
      setError('Error unregistering: ' + (err.response?.data?.message || err.message))
    }
  }

  const openEditModal = (event) => {
    setEditingEvent(event)
    setEventForm({
      event_name: event.event_name,
      event_type: event.event_type,
      description: event.description || '',
      objectives: event.objectives || '',
      event_date: event.event_date,
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      location: event.location || '',
      capacity: event.capacity || '',
      event_status: event.event_status,
      requirements: event.requirements || '',
      is_active: event.is_active,
    })
    setShowEventModal(true)
  }

  const openDeleteConfirm = (event) => {
    setEventToDelete(event)
    setShowDeleteConfirm(true)
  }

  const getFilteredEvents = (eventList) => {
    return eventList.filter(event => {
      const matchesType = filterType === 'All' || event.event_type === filterType
      const matchesStatus = filterStatus === 'All' || event.event_status === filterStatus
      const matchesSearch = event.event_name.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesType && matchesStatus && matchesSearch
    })
  }

  const renderEventCard = (event, isStudentView = false) => (
    <div key={event.event_id} className="event-card">
      <div className="event-card-header">
        <h3>{event.event_name}</h3>
        <span className={`event-type-badge ${event.event_type.toLowerCase().replace('-', '')}`}>
          {event.event_type}
        </span>
      </div>
      
      <div className="event-card-content">
        <div className="event-detail">
          <strong>Date:</strong> {event.event_date}
        </div>
        {event.start_time && (
          <div className="event-detail">
            <strong>Time:</strong> {event.start_time} - {event.end_time || 'TBD'}
          </div>
        )}
        {event.location && (
          <div className="event-detail">
            <strong>Location:</strong> {event.location}
          </div>
        )}
        {event.capacity && (
          <div className="event-detail">
            <strong>Capacity:</strong> {event.enrolled_count}/{event.capacity}
          </div>
        )}
        <div className="event-detail">
          <strong>Status:</strong> <span className={`status-badge status-${event.event_status.toLowerCase()}`}>
            {event.event_status}
          </span>
        </div>
        {event.description && (
          <div className="event-detail">
            <strong>Description:</strong> {event.description}
          </div>
        )}
      </div>

      <div className="event-card-footer">
        {isStudentView ? (
          <>
            {studentRegistrations[event.event_id] !== 'registered' ? (
              <button 
                className="btn btn-primary"
                onClick={() => handleRegisterStudent(event.event_id)}
              >
                Register
              </button>
            ) : (
              <button 
                className="btn btn-secondary"
                onClick={() => handleUnregisterStudent(event.event_id)}
              >
                Unregister
              </button>
            )}
          </>
        ) : (
          <>
            <button 
              className="btn btn-secondary"
              onClick={() => openEditModal(event)}
            >
              Edit
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => openDeleteConfirm(event)}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )

  const renderAdminTab = () => (
    <>
      <div className="module-controls">
        <button className="btn btn-primary" onClick={() => {
          setEditingEvent(null)
          setEventForm({
            event_name: '',
            event_type: 'Curricular',
            description: '',
            objectives: '',
            event_date: '',
            start_time: '',
            end_time: '',
            location: '',
            capacity: '',
            event_status: 'Pending',
            requirements: '',
            is_active: true,
          })
          setShowEventModal(true)
        }}>
          + Create Event
        </button>
      </div>

      <div className="filter-section">
        <div className="filter-group">
          <label>Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="All">All</option>
            <option value="Curricular">Curricular</option>
            <option value="Extra-Curricular">Extra-Curricular</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Active">Active</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Search:</label>
          <input 
            type="text" 
            placeholder="Search events..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="events-grid">
        {getFilteredEvents(events).length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#999' }}>No events found</p>
        ) : (
          getFilteredEvents(events).map(event => renderEventCard(event, false))
        )}
      </div>
    </>
  )

  const renderStudentTab = (eventList) => (
    <>
      <div className="filter-section">
        <div className="filter-group">
          <label>Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="All">All</option>
            <option value="Curricular">Curricular</option>
            <option value="Extra-Curricular">Extra-Curricular</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Search:</label>
          <input 
            type="text" 
            placeholder="Search events..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="events-grid">
        {getFilteredEvents(eventList).length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#999' }}>No events found</p>
        ) : (
          getFilteredEvents(eventList).map(event => renderEventCard(event, true))
        )}
      </div>
    </>
  )

  return (
    <div className="student-dashboard">
      <div className="module-container">
        <div className="module-sidebar">
          <h3>Events Module</h3>
          <div className="tab-navigation">
            {isAdmin ? (
              <>
                <button
                  className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
                  onClick={() => setActiveTab('manage')}
                >
                  ⚙️ Manage Events
                </button>
              </>
            ) : (
              <>
                <button
                  className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                  onClick={() => setActiveTab('upcoming')}
                >
                  📅 Upcoming Events
                </button>
                <button
                  className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                  onClick={() => setActiveTab('past')}
                >
                  📋 Past Events
                </button>
              </>
            )}
          </div>
        </div>

        <main className="module-content">
          {error && (
            <div style={{
              background: '#fee',
              border: '1px solid #fcc',
              color: '#c33',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              {error}
              <button onClick={() => setError('')} style={{
                marginLeft: '10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#c33'
              }}>✕</button>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
              Loading events...
            </div>
          ) : (
            <>
              {isAdmin && activeTab === 'manage' && renderAdminTab()}
              {isStudent && activeTab === 'upcoming' && renderStudentTab(upcomingEvents)}
              {isStudent && activeTab === 'past' && renderStudentTab(pastEvents)}
            </>
          )}
        </main>
      </div>

      {/* Event Form Modal */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowEventModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}>
              <div className="form-group">
                <label>Event Name *</label>
                <input 
                  type="text"
                  value={eventForm.event_name}
                  onChange={(e) => setEventForm({...eventForm, event_name: e.target.value})}
                  placeholder="Enter event name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Event Type *</label>
                  <select 
                    value={eventForm.event_type}
                    onChange={(e) => setEventForm({...eventForm, event_type: e.target.value})}
                  >
                    <option value="Curricular">Curricular</option>
                    <option value="Extra-Curricular">Extra-Curricular</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select 
                    value={eventForm.event_status}
                    onChange={(e) => setEventForm({...eventForm, event_status: e.target.value})}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  placeholder="Enter event description"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Objectives</label>
                <textarea 
                  value={eventForm.objectives}
                  onChange={(e) => setEventForm({...eventForm, objectives: e.target.value})}
                  placeholder="Enter event objectives"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Event Date *</label>
                  <input 
                    type="date"
                    value={eventForm.event_date}
                    onChange={(e) => setEventForm({...eventForm, event_date: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Start Time</label>
                  <input 
                    type="time"
                    value={eventForm.start_time}
                    onChange={(e) => setEventForm({...eventForm, start_time: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>End Time</label>
                  <input 
                    type="time"
                    value={eventForm.end_time}
                    onChange={(e) => setEventForm({...eventForm, end_time: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input 
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                    placeholder="Enter location"
                  />
                </div>

                <div className="form-group">
                  <label>Capacity</label>
                  <input 
                    type="number"
                    value={eventForm.capacity}
                    onChange={(e) => setEventForm({...eventForm, capacity: e.target.value})}
                    placeholder="Enter capacity"
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Requirements</label>
                <textarea 
                  value={eventForm.requirements}
                  onChange={(e) => setEventForm({...eventForm, requirements: e.target.value})}
                  placeholder="Enter any requirements"
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>
                  <input 
                    type="checkbox"
                    checked={eventForm.is_active}
                    onChange={(e) => setEventForm({...eventForm, is_active: e.target.checked})}
                  />
                  Active
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEventModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && eventToDelete && (
        <DeleteConfirmModal 
          title="Delete Event"
          message={`Are you sure you want to delete the event "${eventToDelete.event_name}"?`}
          onConfirm={handleDeleteEvent}
          onCancel={() => {
            setShowDeleteConfirm(false)
            setEventToDelete(null)
          }}
        />
      )}
    </div>
  )
}

export default EventsModule

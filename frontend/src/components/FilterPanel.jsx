import { useState } from 'react'
import '../styles/FilterPanel.css'

function FilterPanel({ filters, onFilterChange, onReset, availableSkills = [], availableAffiliations = [], onFilterBySkill, onFilterByAffiliation }) {
  const [expandedSections, setExpandedSections] = useState({
    gender: true,
    identification: true,
    yearLevel: true,
    status: true,
    academics: true,
    skills: false,
    affiliations: false
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleMultiSelect = (filterName, value) => {
    const updatedList = filters[filterName].includes(value)
      ? filters[filterName].filter(item => item !== value)
      : [...filters[filterName], value]
    
    onFilterChange({
      ...filters,
      [filterName]: updatedList
    })
  }

  const handleRangeChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: parseFloat(value)
    })
  }

  const genderOptions = ['Male', 'Female', 'Prefer not to say']
  const identificationOptions = ['Regular', 'Irregular', 'Graduated', 'On Leave', 'Dropped']
  const yearLevelOptions = [1, 2, 3, 4]
  const statusOptions = ['Enrolled', 'On Leave', 'Graduated', 'Dropped']

  const activeFilterCount = [
    ...filters.gender,
    ...filters.student_identification,
    ...filters.year_level,
    ...filters.status
  ].length

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h2>Filters</h2>
        {activeFilterCount > 0 && (
          <div className="filter-badge">{activeFilterCount}</div>
        )}
      </div>

      {/* Gender Filter */}
      <FilterSection
        title="Gender"
        section="gender"
        isExpanded={expandedSections.gender}
        onToggle={toggleSection}
      >
        <div className="filter-options">
          {genderOptions.map(gender => (
            <label key={gender} className="filter-option">
              <input
                type="checkbox"
                checked={filters.gender.includes(gender)}
                onChange={() => handleMultiSelect('gender', gender)}
              />
              <span>{gender}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Student Identification */}
      <FilterSection
        title="Student Status"
        section="identification"
        isExpanded={expandedSections.identification}
        onToggle={toggleSection}
      >
        <div className="filter-options">
          {identificationOptions.map(option => (
            <label key={option} className="filter-option">
              <input
                type="checkbox"
                checked={filters.student_identification.includes(option)}
                onChange={() => handleMultiSelect('student_identification', option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Year Level */}
      <FilterSection
        title="Year Level"
        section="yearLevel"
        isExpanded={expandedSections.yearLevel}
        onToggle={toggleSection}
      >
        <div className="filter-options">
          {yearLevelOptions.map(year => (
            <label key={year} className="filter-option">
              <input
                type="checkbox"
                checked={filters.year_level.includes(year)}
                onChange={() => handleMultiSelect('year_level', year)}
              />
              <span>Year {year}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Enrollment Status */}
      <FilterSection
        title="Enrollment Status"
        section="status"
        isExpanded={expandedSections.status}
        onToggle={toggleSection}
      >
        <div className="filter-options">
          {statusOptions.map(status => (
            <label key={status} className="filter-option">
              <input
                type="checkbox"
                checked={filters.status.includes(status)}
                onChange={() => handleMultiSelect('status', status)}
              />
              <span>{status}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Academic Performance */}
      <FilterSection
        title="Academic Performance"
        section="academics"
        isExpanded={expandedSections.academics}
        onToggle={toggleSection}
      >
        <div className="range-filter">
          <label>GPA Range</label>
          <div className="range-inputs">
            <input
              type="number"
              min="0"
              max="4"
              step="0.1"
              value={filters.gpa_min}
              onChange={(e) => handleRangeChange('gpa_min', e.target.value)}
              placeholder="Min"
              className="range-input"
            />
            <span>to</span>
            <input
              type="number"
              min="0"
              max="4"
              step="0.1"
              value={filters.gpa_max}
              onChange={(e) => handleRangeChange('gpa_max', e.target.value)}
              placeholder="Max"
              className="range-input"
            />
          </div>
          <div className="range-display">
            {filters.gpa_min.toFixed(1)} - {filters.gpa_max.toFixed(1)}
          </div>
        </div>

        <div className="range-filter">
          <label>Attendance Rate (%)</label>
          <div className="range-inputs">
            <input
              type="number"
              min="0"
              max="100"
              step="5"
              value={filters.attendance_min}
              onChange={(e) => handleRangeChange('attendance_min', e.target.value)}
              placeholder="Min"
              className="range-input"
            />
            <span>to</span>
            <input
              type="number"
              min="0"
              max="100"
              step="5"
              value={filters.attendance_max}
              onChange={(e) => handleRangeChange('attendance_max', e.target.value)}
              placeholder="Max"
              className="range-input"
            />
          </div>
          <div className="range-display">
            {filters.attendance_min}% - {filters.attendance_max}%
          </div>
        </div>

        <div className="range-filter">
          <label>Violations Count</label>
          <div className="range-inputs">
            <input
              type="number"
              min="0"
              step="1"
              value={filters.violations_min}
              onChange={(e) => handleRangeChange('violations_min', e.target.value)}
              placeholder="Min"
              className="range-input"
            />
            <span>to</span>
            <input
              type="number"
              min="0"
              step="1"
              value={filters.violations_max}
              onChange={(e) => handleRangeChange('violations_max', e.target.value)}
              placeholder="Max"
              className="range-input"
            />
          </div>
          <div className="range-display">
            {filters.violations_min} - {filters.violations_max}
          </div>
        </div>
      </FilterSection>

      {/* Skills Filter */}
      {availableSkills && availableSkills.length > 0 && (
        <FilterSection
          title="Skills"
          section="skills"
          isExpanded={expandedSections.skills}
          onToggle={toggleSection}
        >
          <div className="filter-options">
            {availableSkills.map(skill => (
              <label key={skill} className="filter-option">
                <input
                  type="radio"
                  name="skill"
                  value={skill}
                  checked={filters.skills.includes(skill)}
                  onChange={() => onFilterBySkill ? onFilterBySkill(skill) : handleMultiSelect('skills', skill)}
                />
                <span>{skill}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Affiliations Filter */}
      {availableAffiliations && availableAffiliations.length > 0 && (
        <FilterSection
          title="Affiliations"
          section="affiliations"
          isExpanded={expandedSections.affiliations}
          onToggle={toggleSection}
        >
          <div className="filter-options">
            {availableAffiliations.map(affiliation => (
              <label key={affiliation} className="filter-option">
                <input
                  type="radio"
                  name="affiliation"
                  value={affiliation}
                  checked={filters.affiliations.includes(affiliation)}
                  onChange={() => onFilterByAffiliation ? onFilterByAffiliation(affiliation) : handleMultiSelect('affiliations', affiliation)}
                />
                <span>{affiliation}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Reset Button */}
      <button className="reset-filters-btn" onClick={onReset}>
        ↻ Reset All Filters
      </button>
    </div>
  )
}

function FilterSection({ title, section, isExpanded, onToggle, children }) {
  return (
    <div className="filter-section">
      <button
        className="section-header"
        onClick={() => onToggle(section)}
      >
        <span className="section-title">{title}</span>
        <span className="toggle-icon">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>
      {isExpanded && (
        <div className="section-content">
          {children}
        </div>
      )}
    </div>
  )
}

export default FilterPanel

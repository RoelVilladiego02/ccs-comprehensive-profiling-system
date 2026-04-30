import jsPDF from 'jspdf'
import 'jspdf-autotable'
import html2canvas from 'html2canvas'

/**
 * Export eligibility report to PDF
 * @param {string} reportType - Type of report (skill, affiliation, combined, academic)
 * @param {Array} students - Array of student data to include in report
 * @param {Object} filters - Filter criteria used for the report
 */
export const exportEligibilityReportToPDF = async (reportType, students, filters) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 10
    let yPosition = margin

    // ============================================================================
    // HEADER SECTION
    // ============================================================================
    doc.setFontSize(20)
    doc.setTextColor(33, 37, 41) // Dark gray
    doc.text('CCS - Eligibility Reports', margin, yPosition)
    yPosition += 10

    // Report generation date
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition)
    yPosition += 7

    // Add a line separator
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 8

    // ============================================================================
    // REPORT INFO SECTION
    // ============================================================================
    doc.setFontSize(12)
    doc.setTextColor(50, 50, 50)
    doc.text('Report Information', margin, yPosition)
    yPosition += 6

    doc.setFontSize(10)
    doc.setTextColor(70, 70, 70)

    // Report type
    const reportTypeDisplay = {
      skill: 'Skills Only',
      affiliation: 'Affiliations Only',
      combined: 'Combined (Skills + Affiliations)',
      academic: 'Academic Performance',
    }

    doc.text(`Report Type: ${reportTypeDisplay[reportType] || 'Unknown'}`, margin + 5, yPosition)
    yPosition += 5

    // Filter details based on report type
    if (reportType === 'skill' && filters.selectedSkill) {
      doc.text(`Skill: ${filters.selectedSkill}`, margin + 5, yPosition)
      yPosition += 5
    }

    if (reportType === 'affiliation' && filters.selectedAffiliation) {
      doc.text(`Affiliation: ${filters.selectedAffiliation}`, margin + 5, yPosition)
      yPosition += 5
    }

    if (reportType === 'combined') {
      if (filters.selectedSkill) {
        doc.text(`Skill: ${filters.selectedSkill}`, margin + 5, yPosition)
        yPosition += 5
      }
      if (filters.selectedAffiliation) {
        doc.text(`Affiliation: ${filters.selectedAffiliation}`, margin + 5, yPosition)
        yPosition += 5
      }
    }

    if (reportType === 'academic' || filters.minGPA > 0) {
      doc.text(`Minimum GPA: ${filters.minGPA || 0}`, margin + 5, yPosition)
      yPosition += 5
    }

    if (filters.maxViolations !== undefined && filters.maxViolations !== 999) {
      doc.text(`Max Violations: ${filters.maxViolations}`, margin + 5, yPosition)
      yPosition += 5
    }

    if (filters.enrollmentStatus && reportType === 'academic') {
      doc.text(`Enrollment Status: ${filters.enrollmentStatus}`, margin + 5, yPosition)
      yPosition += 5
    }

    yPosition += 5

    // ============================================================================
    // STUDENTS TABLE SECTION
    // ============================================================================
    doc.setFontSize(12)
    doc.setTextColor(50, 50, 50)
    doc.text(`Results: ${students.length} Student(s)`, margin, yPosition)
    yPosition += 8

    // Create table data
    const tableColumns = ['#', 'Student ID', 'Name', 'Email', 'GPA', 'Violations', 'Status']
    const tableRows = students.map((student, index) => [
      index + 1,
      student.student_number || 'N/A',
      `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'N/A',
      student.email || 'N/A',
      (student.gpa || 0).toFixed(2),
      student.violationsCount || 0,
      student.student_identification || 'N/A',
    ])

    // Table styling
    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: yPosition,
      margin: margin,
      didDrawPage: () => {},
      headerStyles: {
        fillColor: [41, 128, 185], // Blue
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center',
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        fontSize: 9,
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      rowPageBreak: 'avoid',
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'left', cellWidth: 50 },
        3: { halign: 'left', cellWidth: 60 },
        4: { halign: 'center', cellWidth: 20 },
        5: { halign: 'center', cellWidth: 25 },
        6: { halign: 'center', cellWidth: 35 },
      },
    })

    // ============================================================================
    // FOOTER SECTION
    // ============================================================================
    const pageCount = doc.internal.pages.length - 1

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(9)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin - 20,
        pageHeight - 5,
        { align: 'right' }
      )
      doc.text(
        'CCS Comprehensive Profiling System',
        margin,
        pageHeight - 5
      )
    }

    // ============================================================================
    // SAVE PDF
    // ============================================================================
    const filename = `eligibility-report-${reportType}-${new Date().getTime()}.pdf`
    doc.save(filename)

    return {
      success: true,
      message: `Report exported successfully as ${filename}`,
    }
  } catch (error) {
    console.error('Error exporting PDF:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Export using HTML2Canvas for more complex layouts
 * @param {string} elementId - ID of the HTML element to capture
 * @param {string} filename - Name for the PDF file
 */
export const exportHTMLElementToPDF = async (elementId, filename) => {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`)
    }

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
    })

    // Convert canvas to PDF
    const imgData = canvas.toDataURL('image/png')
    const doc = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const imgWidth = pageWidth - 10
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let yPosition = 5

    // Add image to PDF
    doc.addImage(imgData, 'PNG', 5, yPosition, imgWidth, imgHeight)

    // If image is taller than page, add additional pages
    if (imgHeight > pageHeight - 10) {
      let heightLeft = imgHeight - (pageHeight - 15)
      let position = pageHeight - 5

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        doc.addPage()
        doc.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
    }

    doc.save(filename || 'export.pdf')

    return {
      success: true,
      message: 'Document exported to PDF successfully',
    }
  } catch (error) {
    console.error('Error exporting HTML to PDF:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Generate a detailed student profile PDF
 * @param {Object} student - Student object with profile data
 */
export const exportStudentProfilePDF = (student) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 10
    let yPosition = margin

    // Header
    doc.setFontSize(18)
    doc.setTextColor(33, 37, 41)
    doc.text('Student Profile Report', margin, yPosition)
    yPosition += 12

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition)
    yPosition += 8

    // Separator
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    // Student Information
    doc.setFontSize(12)
    doc.setTextColor(50, 50, 50)
    doc.text('Student Information', margin, yPosition)
    yPosition += 8

    doc.setFontSize(10)
    doc.setTextColor(70, 70, 70)

    const studentInfo = [
      [`Name:`, `${student.first_name || ''} ${student.last_name || ''}`.trim()],
      [`Student ID:`, student.student_number || 'N/A'],
      [`Email:`, student.email || 'N/A'],
      [`Status:`, student.student_identification || 'N/A'],
      [`GPA:`, (student.gpa || 0).toFixed(2)],
      [`Violations:`, student.violationsCount || 0],
    ]

    studentInfo.forEach(([label, value]) => {
      doc.text(label, margin + 5, yPosition)
      doc.text(value, margin + 50, yPosition)
      yPosition += 6
    })

    yPosition += 5

    // Skills Section
    if (student.skills && student.skills.length > 0) {
      doc.setFontSize(11)
      doc.setTextColor(50, 50, 50)
      doc.text('Skills', margin, yPosition)
      yPosition += 6

      doc.setFontSize(9)
      student.skills.forEach((skill) => {
        doc.text(`• ${skill.skill_name || 'Unknown'}`, margin + 5, yPosition)
        yPosition += 4
      })
      yPosition += 3
    }

    // Affiliations Section
    if (student.affiliations && student.affiliations.length > 0) {
      doc.setFontSize(11)
      doc.setTextColor(50, 50, 50)
      doc.text('Affiliations', margin, yPosition)
      yPosition += 6

      doc.setFontSize(9)
      student.affiliations.forEach((aff) => {
        doc.text(`• ${aff.affiliation_name || 'Unknown'}`, margin + 5, yPosition)
        yPosition += 4
      })
    }

    const filename = `student-profile-${student.student_number || student.student_id}-${new Date().getTime()}.pdf`
    doc.save(filename)

    return {
      success: true,
      message: `Student profile exported as ${filename}`,
    }
  } catch (error) {
    console.error('Error exporting student profile:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

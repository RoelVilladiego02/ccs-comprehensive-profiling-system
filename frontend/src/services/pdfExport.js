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
    const margin = 12
    let yPosition = margin

    // System theme colors
    const colors = {
      primary: [13, 13, 13], // Black #0d0d0d
      accent: [255, 100, 20], // Orange #ff6414
      accentDark: [255, 82, 0], // Darker Orange
      lightBg: [247, 246, 243], // Light beige #f7f6f3
      darkText: [50, 50, 50], // Dark gray
      mediumText: [100, 100, 100], // Medium gray
      lightText: [150, 150, 150], // Light gray
      white: [255, 255, 255],
      success: [76, 175, 80], // Green
      warning: [255, 152, 0], // Amber
      danger: [244, 67, 54], // Red
    }

    // ============================================================================
    // HEADER SECTION WITH LOGO/BRANDING
    // ============================================================================
    
    // Orange top bar
    doc.setFillColor(...colors.accent)
    doc.rect(0, 0, pageWidth, 15, 'F')

    // White text on orange bar
    doc.setFontSize(18)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(...colors.white)
    doc.text('CCS ELIGIBILITY REPORTS', margin, 10)

    // Report type badge
    const reportTypeDisplay = {
      skill: 'Skills Only',
      affiliation: 'Affiliations Only',
      combined: 'Combined Criteria',
      academic: 'Academic Performance',
    }
    
    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    const reportTypeText = reportTypeDisplay[reportType] || 'Unknown'
    const textWidth = doc.getTextWidth(reportTypeText)
    doc.text(reportTypeText, pageWidth - margin - textWidth, 10)

    yPosition = 22

    // Generation info
    doc.setFontSize(9)
    doc.setTextColor(...colors.mediumText)
    const generatedDate = new Date().toLocaleString()
    doc.text(`Generated: ${generatedDate}`, margin, yPosition)
    
    // System branding
    doc.setFont(undefined, 'italic')
    doc.setFontSize(8)
    doc.text('Comprehensive Profiling System', pageWidth - margin - doc.getTextWidth('Comprehensive Profiling System'), yPosition)
    
    yPosition += 8

    // Elegant separator line
    doc.setDrawColor(...colors.accent)
    doc.setLineWidth(1.5)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 6

    // ============================================================================
    // REPORT CRITERIA SECTION
    // ============================================================================
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('📋 Report Criteria', margin, yPosition)
    yPosition += 6

    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(...colors.darkText)

    // Criteria in organized layout
    let criteriaY = yPosition
    const criteriaX = margin + 5

    if (reportType === 'skill' && filters.selectedSkill) {
      doc.text(`Skill: ${filters.selectedSkill}`, criteriaX, criteriaY)
      criteriaY += 5
    }

    if (reportType === 'affiliation' && filters.selectedAffiliation) {
      doc.text(`Affiliation: ${filters.selectedAffiliation}`, criteriaX, criteriaY)
      criteriaY += 5
    }

    if (reportType === 'combined') {
      if (filters.selectedSkill) {
        doc.text(`Skill: ${filters.selectedSkill}`, criteriaX, criteriaY)
        criteriaY += 5
      }
      if (filters.selectedAffiliation) {
        doc.text(`Affiliation: ${filters.selectedAffiliation}`, criteriaX, criteriaY)
        criteriaY += 5
      }
    }

    if (filters.minGPA > 0 || reportType === 'academic') {
      doc.text(`Minimum GPA: ${filters.minGPA}`, criteriaX, criteriaY)
      criteriaY += 5
    }

    if (filters.maxViolations !== undefined && filters.maxViolations !== 999) {
      doc.text(`Max Violations: ${filters.maxViolations}`, criteriaX, criteriaY)
      criteriaY += 5
    }

    yPosition = criteriaY + 3

    // ============================================================================
    // SUMMARY STATISTICS
    // ============================================================================
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.text('📊 Summary', margin, yPosition)
    yPosition += 6

    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    
    const avgGPA = (students.reduce((sum, s) => sum + (s.gpa || 0), 0) / students.length).toFixed(2)
    const avgViolations = (students.reduce((sum, s) => sum + (s.violationsCount || 0), 0) / students.length).toFixed(1)
    const cleanStudents = students.filter(s => (s.violationsCount || 0) === 0).length

    doc.setTextColor(...colors.darkText)
    doc.text(`Total Students: ${students.length} | Average GPA: ${avgGPA} | Clean Records: ${cleanStudents}`, margin + 5, yPosition)
    yPosition += 7

    // Separator
    doc.setDrawColor(...colors.accent)
    doc.setLineWidth(0.5)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 5

    // ============================================================================
    // RESULTS TABLE
    // ============================================================================
    const tableColumns = ['#', 'Student ID', 'Name', 'Email', 'GPA', 'Status', 'Violations']
    const tableRows = students.map((student, index) => [
      index + 1,
      student.student_number || 'N/A',
      `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'N/A',
      student.email || 'N/A',
      (student.gpa || 0).toFixed(2),
      student.student_identification || 'Active',
      student.violationsCount || 0,
    ])

    // Enhanced table with theme colors
    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: yPosition,
      margin: margin,
      didDrawPage: () => {},
      headerStyles: {
        fillColor: colors.primary, // Black header
        textColor: colors.white,
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center',
        valign: 'middle',
        lineColor: colors.accent,
        lineWidth: 0.5,
      },
      bodyStyles: {
        textColor: colors.darkText,
        fontSize: 9,
        halign: 'center',
        lineColor: [230, 230, 230],
        lineWidth: 0.1,
      },
      alternateRowStyles: {
        fillColor: colors.lightBg,
      },
      rowPageBreak: 'avoid',
      willDrawCell: (data) => {
        // Highlight GPA and violations columns
        if (data.column.index === 4) { // GPA column
          const gpa = parseFloat(data.cell.text[0])
          if (gpa >= 3.5) {
            data.cell.fillColor = [76, 175, 80, 0.1] // Light green
          } else if (gpa < 2.0) {
            data.cell.fillColor = [244, 67, 54, 0.1] // Light red
          }
        }
        if (data.column.index === 6) { // Violations column
          const violations = parseInt(data.cell.text[0])
          if (violations > 0) {
            data.cell.fillColor = [255, 152, 0, 0.1] // Light orange
          }
        }
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'center', cellWidth: 22 },
        2: { halign: 'left', cellWidth: 48 },
        3: { halign: 'left', cellWidth: 52 },
        4: { halign: 'center', cellWidth: 18 },
        5: { halign: 'center', cellWidth: 26 },
        6: { halign: 'center', cellWidth: 18 },
      },
    })

    // ============================================================================
    // FOOTER ON EACH PAGE
    // ============================================================================
    const pageCount = doc.internal.pages.length - 1

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      
      // Bottom border
      doc.setDrawColor(...colors.accent)
      doc.setLineWidth(1.5)
      doc.line(margin, pageHeight - 8, pageWidth - margin, pageHeight - 8)

      // Footer text
      doc.setFontSize(8)
      doc.setTextColor(...colors.lightText)
      doc.setFont(undefined, 'italic')
      
      // Left: System info
      doc.text(
        'CCS - Comprehensive Profiling System',
        margin,
        pageHeight - 4
      )

      // Right: Page number
      doc.setFont(undefined, 'normal')
      const pageText = `Page ${i} of ${pageCount}`
      doc.text(
        pageText,
        pageWidth - margin - doc.getTextWidth(pageText),
        pageHeight - 4
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
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 12
    let yPosition = margin

    // System theme colors
    const colors = {
      primary: [13, 13, 13], // Black
      accent: [255, 100, 20], // Orange
      accentDark: [255, 82, 0],
      lightBg: [247, 246, 243],
      darkText: [50, 50, 50],
      mediumText: [100, 100, 100],
      lightText: [150, 150, 150],
      white: [255, 255, 255],
      success: [76, 175, 80],
      warning: [255, 152, 0],
      danger: [244, 67, 54],
    }

    // ============================================================================
    // HEADER WITH ORANGE BAR
    // ============================================================================
    doc.setFillColor(...colors.accent)
    doc.rect(0, 0, pageWidth, 18, 'F')

    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(...colors.white)
    doc.text('STUDENT PROFILE', margin, 11)

    yPosition = 22

    // Generation date
    doc.setFontSize(8)
    doc.setTextColor(...colors.lightText)
    doc.setFont(undefined, 'italic')
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition)
    yPosition += 6

    // Separator
    doc.setDrawColor(...colors.accent)
    doc.setLineWidth(1.5)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 8

    // ============================================================================
    // STUDENT BASIC INFORMATION
    // ============================================================================
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('👤 PERSONAL INFORMATION', margin, yPosition)
    yPosition += 6

    // Create info box
    doc.setFillColor(...colors.lightBg)
    doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 35, 'F')
    doc.setDrawColor(...colors.accent)
    doc.setLineWidth(0.5)
    doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 35)

    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(...colors.darkText)

    const fullName = `${student.first_name || ''} ${student.middle_name || ''} ${student.last_name || ''}`.trim()
    const infoX = margin + 4
    const infoLabelWidth = 50

    let infoY = yPosition + 2
    
    doc.text('Student Number:', infoX, infoY)
    doc.setFont(undefined, 'bold')
    doc.text(student.student_number || 'N/A', infoX + infoLabelWidth, infoY)
    doc.setFont(undefined, 'normal')
    
    infoY += 6
    doc.text('Full Name:', infoX, infoY)
    doc.setFont(undefined, 'bold')
    doc.text(fullName || 'N/A', infoX + infoLabelWidth, infoY)
    doc.setFont(undefined, 'normal')
    
    infoY += 6
    doc.text('Email:', infoX, infoY)
    doc.setFont(undefined, 'bold')
    doc.text(student.email || 'N/A', infoX + infoLabelWidth, infoY)
    doc.setFont(undefined, 'normal')
    
    infoY += 6
    doc.text('Status:', infoX, infoY)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(...colors.accent)
    doc.text(student.student_identification || 'Active', infoX + infoLabelWidth, infoY)
    doc.setTextColor(...colors.darkText)
    doc.setFont(undefined, 'normal')

    yPosition += 40

    // ============================================================================
    // ACADEMIC PERFORMANCE
    // ============================================================================
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('🎓 ACADEMIC PERFORMANCE', margin, yPosition)
    yPosition += 6

    // GPA and Violations in colored boxes
    doc.setFillColor(...colors.lightBg)
    doc.rect(margin, yPosition - 4, (pageWidth - 3 * margin) / 2, 20, 'F')
    doc.setDrawColor(...colors.accent)
    doc.setLineWidth(0.5)
    doc.rect(margin, yPosition - 4, (pageWidth - 3 * margin) / 2, 20)

    // GPA Box
    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(...colors.mediumText)
    doc.text('GPA', margin + 4, yPosition + 2)
    
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    const gpa = (student.gpa || 0).toFixed(2)
    doc.setTextColor(...colors.accent)
    doc.text(gpa, margin + 4, yPosition + 12)

    // Violations Box
    doc.setFillColor(...colors.lightBg)
    const boxX = margin + (pageWidth - 3 * margin) / 2 + margin
    doc.rect(boxX, yPosition - 4, (pageWidth - 3 * margin) / 2, 20, 'F')
    doc.setDrawColor(...colors.accent)
    doc.rect(boxX, yPosition - 4, (pageWidth - 3 * margin) / 2, 20)

    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(...colors.mediumText)
    doc.text('Violations', boxX + 4, yPosition + 2)
    
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(student.violationsCount > 0 ? colors.danger[0] : colors.success[0], 
                     student.violationsCount > 0 ? colors.danger[1] : colors.success[1],
                     student.violationsCount > 0 ? colors.danger[2] : colors.success[2])
    doc.text((student.violationsCount || 0).toString(), boxX + 4, yPosition + 12)

    yPosition += 28

    // ============================================================================
    // SKILLS SECTION
    // ============================================================================
    if (student.skills && student.skills.length > 0) {
      doc.setFontSize(11)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(...colors.primary)
      doc.text('🎯 SKILLS', margin, yPosition)
      yPosition += 6

      doc.setFontSize(9)
      doc.setFont(undefined, 'normal')
      doc.setTextColor(...colors.darkText)

      student.skills.forEach((skill, idx) => {
        const skillName = typeof skill === 'string' ? skill : (skill?.skill_name || 'Unknown')
        
        // Skill pill background
        doc.setFillColor(...colors.accent)
        doc.roundedRect(margin + 2, yPosition - 2, 40, 6, 2, 2, 'F')
        
        doc.setTextColor(...colors.white)
        doc.setFont(undefined, 'bold')
        doc.setFontSize(8)
        doc.text(skillName, margin + 5, yPosition + 2)
        
        yPosition += 8
      })

      yPosition += 2
    }

    // ============================================================================
    // AFFILIATIONS SECTION
    // ============================================================================
    if (student.affiliations && student.affiliations.length > 0) {
      doc.setFontSize(11)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(...colors.primary)
      doc.text('🏢 AFFILIATIONS', margin, yPosition)
      yPosition += 6

      doc.setFontSize(9)
      doc.setFont(undefined, 'normal')
      doc.setTextColor(...colors.darkText)

      student.affiliations.forEach((affiliation) => {
        const affName = typeof affiliation === 'string' ? affiliation : (affiliation?.organization_name || 'Unknown')
        
        // Affiliation item with border
        doc.setDrawColor(...colors.accent)
        doc.setLineWidth(0.3)
        doc.rect(margin + 2, yPosition - 3, pageWidth - 2 * margin - 4, 5)
        
        doc.setFont(undefined, 'normal')
        doc.setTextColor(...colors.darkText)
        doc.text(`• ${affName}`, margin + 5, yPosition + 1)
        
        yPosition += 7
      })

      yPosition += 2
    }

    // ============================================================================
    // FOOTER
    // ============================================================================
    doc.setFontSize(8)
    doc.setTextColor(...colors.lightText)
    
    // Bottom border
    doc.setDrawColor(...colors.accent)
    doc.setLineWidth(1.5)
    doc.line(margin, pageHeight - 8, pageWidth - margin, pageHeight - 8)

    // Footer text
    doc.setFont(undefined, 'italic')
    doc.text('CCS - Comprehensive Profiling System', margin, pageHeight - 4)
    
    doc.setFont(undefined, 'normal')
    doc.text(
      `Student ID: ${student.student_number || 'N/A'}`,
      pageWidth - margin - doc.getTextWidth(`Student ID: ${student.student_number || 'N/A'}`),
      pageHeight - 4
    )

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

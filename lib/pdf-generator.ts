import jsPDF from 'jspdf'
import { Application } from './data-store'

export interface StudentDetails {
  studentName: string
  email: string
  phone: string
  dateOfBirth?: string
  nationality?: string
  address?: string
  previousEducation?: string
  gpa?: string
  englishProficiency?: string
  personalStatement?: string
  workExperience?: string
}

export interface AdmissionFormData {
  application: Application
  studentDetails?: StudentDetails
  agencyName: string
  collegeName: string
  courseName: string
  submissionDate: string
}

export class PDFGenerator {
  private doc: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margin: number
  private currentY: number

  constructor() {
    this.doc = new jsPDF()
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.margin = 20
    this.currentY = this.margin
  }

  private addHeader(title: string) {
    this.doc.setFontSize(20)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.pageWidth / 2, this.currentY, { align: 'center' })
    this.currentY += 15
    
    // Add a line under the header
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.currentY += 10
  }

  private addSection(title: string) {
    this.checkPageBreak(20)
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin, this.currentY)
    this.currentY += 8
  }

  private addField(label: string, value: string, inline: boolean = false) {
    this.checkPageBreak(15)
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    
    if (inline) {
      this.doc.text(`${label}:`, this.margin, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(value || 'N/A', this.margin + 50, this.currentY)
      this.currentY += 6
    } else {
      this.doc.text(`${label}:`, this.margin, this.currentY)
      this.currentY += 5
      this.doc.setFont('helvetica', 'normal')
      const lines = this.doc.splitTextToSize(value || 'N/A', this.pageWidth - 2 * this.margin)
      this.doc.text(lines, this.margin + 10, this.currentY)
      this.currentY += lines.length * 5 + 5
    }
  }

  private addTwoColumnFields(leftLabel: string, leftValue: string, rightLabel: string, rightValue: string) {
    this.checkPageBreak(15)
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    
    const midPoint = this.pageWidth / 2
    
    // Left column
    this.doc.text(`${leftLabel}:`, this.margin, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(leftValue || 'N/A', this.margin, this.currentY + 5)
    
    // Right column
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(`${rightLabel}:`, midPoint, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(rightValue || 'N/A', midPoint, this.currentY + 5)
    
    this.currentY += 15
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage()
      this.currentY = this.margin
    }
  }

  private addPhoto(imageData: string, width: number = 40, height: number = 50) {
    this.checkPageBreak(height + 10)
    try {
      this.doc.addImage(imageData, 'JPEG', this.margin, this.currentY, width, height)
      this.currentY += height + 5
    } catch (error) {
      console.error('Error adding image to PDF:', error)
      this.addField('Photo', 'Unable to display image', true)
    }
  }

  private addFooter() {
    const footerY = this.pageHeight - 15
    this.doc.setFontSize(8)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(
      `Generated on: ${new Date().toLocaleString()}`,
      this.margin,
      footerY
    )
    this.doc.text(
      `Page ${this.doc.getCurrentPageInfo().pageNumber}`,
      this.pageWidth - this.margin,
      footerY,
      { align: 'right' }
    )
  }

  generateAdmissionForm(data: AdmissionFormData): string {
    // Header
    this.addHeader('STUDENT ADMISSION APPLICATION FORM')
    
    // Application Information
    this.addSection('Application Information')
    this.addTwoColumnFields(
      'Application ID', data.application.id,
      'Status', data.application.status.toUpperCase()
    )
    this.addTwoColumnFields(
      'Submission Date', new Date(data.application.submittedAt).toLocaleDateString(),
      'Agency', data.agencyName
    )
    
    // Student Information
    this.addSection('Student Information')
    
    // Add student photo if available
    const photoDoc = data.application.uploadedDocuments?.find((doc: any) => doc.type === 'photo')
    if (photoDoc && photoDoc.fileData) {
      this.addField('Student Photo', '', true)
      this.addPhoto(photoDoc.fileData)
    }
    
    this.addField('Full Name', data.application.studentName, true)
    this.addTwoColumnFields(
      'Email Address', data.application.email,
      'Phone Number', data.application.phone
    )
    
    if (data.studentDetails) {
      this.addTwoColumnFields(
        'Date of Birth', data.studentDetails.dateOfBirth || 'N/A',
        'Nationality', data.studentDetails.nationality || 'N/A'
      )
      this.addField('Address', data.studentDetails.address || 'N/A')
    }
    
    // Academic Information
    this.addSection('Academic Information')
    this.addField('Previous Education', data.studentDetails?.previousEducation || 'N/A')
    this.addTwoColumnFields(
      'GPA/Grade', data.studentDetails?.gpa || 'N/A',
      'English Proficiency', data.studentDetails?.englishProficiency || 'N/A'
    )
    
    // Program Information
    this.addSection('Program Information')
    this.addField('College/University', data.collegeName, true)
    this.addField('Course/Program', data.courseName, true)
    this.addField('Application Fees', `$${data.application.fees.toLocaleString()}`, true)
    
    // Personal Statement
    if (data.studentDetails?.personalStatement) {
      this.addSection('Personal Statement')
      this.addField('Statement', data.studentDetails.personalStatement)
    }
    
    // Work Experience
    if (data.studentDetails?.workExperience) {
      this.addSection('Work Experience')
      this.addField('Experience', data.studentDetails.workExperience)
    }
    
    // Academic Records
    if (data.application.academicRecords && data.application.academicRecords.length > 0) {
      this.addSection('Academic Records')
      data.application.academicRecords.forEach((record: any) => {
        if (record.level && (record.board || record.year || record.percentage)) {
          this.addField(`${record.level}`, 
            `Board/University: ${record.board || 'N/A'}, Year: ${record.year || 'N/A'}, Marks: ${record.obtainedMarks || 'N/A'}, Percentage: ${record.percentage || 'N/A'}%`)
        }
      })
    }
    
    // Uploaded Documents
    this.addSection('Uploaded Documents')
    if (data.application.uploadedDocuments && data.application.uploadedDocuments.length > 0) {
      data.application.uploadedDocuments.forEach((doc: any, index: number) => {
        if (doc.type === 'photo') {
          // Skip photo as it's already displayed in student info
          return
        }
        
        this.addField(`${doc.type.toUpperCase()} - ${doc.name}`, '', true)
        
        if (doc.fileData && (doc.fileData.includes('image') || doc.type === 'passport' || doc.type === 'aadhar' || doc.type === 'certificate')) {
          // Show document as image if it has image data
          this.addPhoto(doc.fileData, 60, 80)
        } else {
          // Show document info if no image data
          this.addField('Document Info', `${doc.size}MB - Uploaded: ${new Date(doc.uploadedAt).toLocaleDateString()}`, true)
        }
        
        this.currentY += 5 // Add spacing between documents
      })
    } else {
      this.addField('Documents', 'No documents uploaded yet', true)
    }
    
    // Pending Documents
    if (data.application.pendingDocuments && data.application.pendingDocuments.length > 0) {
      this.addSection('Pending Documents')
      data.application.pendingDocuments.forEach((doc, index) => {
        this.addField(`Pending ${index + 1}`, doc, true)
      })
    }
    
    // Additional Information
    if (data.application.abcId || data.application.debId) {
      this.addSection('Additional Information')
      if (data.application.abcId) {
        this.addField('ABC ID', data.application.abcId, true)
      }
      if (data.application.debId) {
        this.addField('DEB ID', data.application.debId, true)
      }
    }
    
    // Declaration
    this.addSection('Declaration')
    const declaration = `I, ${data.application.studentName}, hereby declare that all the information provided in this application form is true and accurate to the best of my knowledge. I understand that any false information may result in the rejection of my application.`
    this.addField('Student Declaration', declaration)
    
    this.currentY += 20
    this.addField('Student Signature', '________________________', true)
    this.addField('Date', '________________________', true)
    
    // Add footer to all pages
    const totalPages = this.doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i)
      this.addFooter()
    }
    
    // Return base64 string
    return this.doc.output('datauristring')
  }

  downloadPDF(filename: string = 'admission-form.pdf') {
    this.doc.save(filename)
  }

  getPDFBlob(): Blob {
    return this.doc.output('blob')
  }
}

export function generateAdmissionFormPDF(data: AdmissionFormData): string {
  const generator = new PDFGenerator()
  return generator.generateAdmissionForm(data)
}
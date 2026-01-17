import { Injectable, Inject, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import type { InferSelectModel } from 'drizzle-orm';
import { eq, and } from 'drizzle-orm';
import { enrollments, users, courses } from '@leap-lms/database';
import PDFDocument from 'pdfkit';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { readFileSync } from 'fs';

@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);
  private readonly certificatesDir = join(process.cwd(), 'storage', 'certificates');

  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>,
  ) {
    // Ensure directory exists
    if (!existsSync(this.certificatesDir)) {
      mkdirSync(this.certificatesDir, { recursive: true });
    }
  }

  async generateCertificatePDF(enrollmentId: number): Promise<{ filePath: string; downloadUrl: string }> {
    const enrollment = await this.db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.id, enrollmentId), eq(enrollments.isDeleted, false)))
      .limit(1);

    if (!enrollment || enrollment.length === 0) {
      throw new NotFoundException(`Enrollment with ID ${enrollmentId} not found`);
    }

    const enrollmentData = enrollment[0];

    // Get user and course information
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, enrollmentData.userId))
      .limit(1);

    const [course] = await this.db
      .select()
      .from(courses)
      .where(eq(courses.id, enrollmentData.courseId))
      .limit(1);

    if (!user || !course) {
      throw new NotFoundException('User or course not found for enrollment');
    }

    // Check if course is completed
    const progressPercentage = Number(enrollmentData.progressPercentage || 0);
    if (progressPercentage !== 100) {
      throw new Error('Course must be completed to generate certificate');
    }
    // todo: generate certificate number 
    const certificateNumber = `CERT-${enrollmentId}-${Date.now()}`;
    const fileName = `${certificateNumber}.pdf`;
    const filePath = join(this.certificatesDir, fileName);

    // Generate PDF
    const doc = new PDFDocument({ 
      size: 'LETTER',
      margin: 50,
      layout: 'landscape'
    });
    const stream = require('fs').createWriteStream(filePath);
    doc.pipe(stream);

    // Background color
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8f9fa');

    // Border
    doc.strokeColor('#2c3e50')
      .lineWidth(5)
      .rect(50, 50, doc.page.width - 100, doc.page.height - 100)
      .stroke();

    // Title
    doc.fontSize(36)
      .fillColor('#2c3e50');
    doc.y = 150;
    doc.text('CERTIFICATE OF COMPLETION', { align: 'center' });

    doc.moveDown(2);

    // Subtitle
    doc.fontSize(18)
      .fillColor('#7f8c8d')
      .text('This is to certify that', { align: 'center' });

    doc.moveDown(1.5);

    // Student name
    const studentName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.email || 'Student';
    
    doc.fontSize(28)
      .fillColor('#2c3e50')
      .font('Helvetica-Bold')
      .text(studentName, { align: 'center' });

    doc.moveDown(1.5);

    // Course completion text
    doc.fontSize(16)
      .fillColor('#34495e')
      .font('Helvetica')
      .text('has successfully completed the course', { align: 'center' });

    doc.moveDown(1);

    // Course name
    doc.fontSize(24)
      .fillColor('#2c3e50')
      .font('Helvetica-Bold')
      .text(course.titleEn || course.titleAr || 'Course', { align: 'center' });

    doc.moveDown(2);

    // Date
    const completionDate = enrollmentData.completedAt 
      ? new Date(enrollmentData.completedAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });

    doc.fontSize(14)
      .fillColor('#7f8c8d')
      .text(`Completed on ${completionDate}`, { align: 'center' });

    doc.moveDown(3);

    // Certificate number
    doc.fontSize(10)
      .fillColor('#95a5a6')
      .text(`Certificate Number: ${certificateNumber}`, { align: 'center' });

    // Footer
    doc.fontSize(10)
      .fillColor('#95a5a6');
    doc.y = doc.page.height - 100;
    doc.text('This certificate is issued by LEAP PM Learning Management System', { align: 'center' });

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', async () => {
        try {
          // Use API endpoint for download
          const downloadUrl = `/api/lms/certificates/${enrollmentId}/download`;
          resolve({ filePath, downloadUrl });
        } catch (error) {
          reject(error);
        }
      });

      stream.on('error', reject);
    });
  }

  async getCertificatePDFPath(enrollmentId: number): Promise<string | null> {
    const enrollment = await this.db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.id, enrollmentId), eq(enrollments.isDeleted, false)))
      .limit(1);

    if (!enrollment || enrollment.length === 0) {
      return null;
    }

    // Look for certificate file (pattern: CERT-{enrollmentId}-*.pdf)
    const fs = require('fs');
    const files = fs.readdirSync(this.certificatesDir);
    const certificateFile = files.find((file: string) => 
      file.startsWith(`CERT-${enrollmentId}-`) && file.endsWith('.pdf')
    );

    if (certificateFile) {
      return join(this.certificatesDir, certificateFile);
    }

    return null;
  }

  /**
   * Generate certificate for a user and course
   */
  async generateCertificate(userId: number, courseId: number): Promise<{ filePath: string; downloadUrl: string; certificateId: string }> {
    // Get enrollment
    const [enrollment] = await this.db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.courseId, courseId),
          eq(enrollments.isDeleted, false),
        ),
      )
      .limit(1);

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Check if course is completed
    const progressPercentage = Number(enrollment.progressPercentage || 0);
    if (progressPercentage < 100) {
      throw new BadRequestException('Course must be completed to generate certificate');
    }

    // Check if certificate already exists
    const existingPath = await this.getCertificatePDFPath(enrollment.id);
    if (existingPath) {
      const certificateId = `CERT-${enrollment.id}`;
      return {
        filePath: existingPath,
        downloadUrl: `/api/v1/lms/certificates/${certificateId}/download`,
        certificateId,
      };
    }

    // Generate new certificate
    const result = await this.generateCertificatePDF(enrollment.id);
    const certificateId = `CERT-${enrollment.id}`;
    
    return {
      ...result,
      downloadUrl: `/api/v1/lms/certificates/${certificateId}/download`,
      certificateId,
    };
  }

  /**
   * Verify certificate authenticity
   */
  async verifyCertificate(certificateId: string): Promise<{
    valid: boolean;
    enrollment?: InferSelectModel<typeof enrollments>;
    user?: InferSelectModel<typeof users>;
    course?: InferSelectModel<typeof courses>;
  }> {
    // Extract enrollment ID from certificate ID (format: CERT-{enrollmentId})
    const parts = certificateId.split('-');
    if (parts.length < 2 || parts[0] !== 'CERT') {
      return { valid: false };
    }

    const enrollmentId = parseInt(parts[1]);
    if (isNaN(enrollmentId)) {
      return { valid: false };
    }

    // Check if certificate file exists
    const certificatePath = await this.getCertificatePDFPath(enrollmentId);
    if (!certificatePath) {
      return { valid: false };
    }

    // Get enrollment details
    const [enrollment] = await this.db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.id, enrollmentId), eq(enrollments.isDeleted, false)))
      .limit(1);

    if (!enrollment) {
      return { valid: false };
    }

    // Get user and course
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, enrollment.userId))
      .limit(1);

    const [course] = await this.db
      .select()
      .from(courses)
      .where(eq(courses.id, enrollment.courseId))
      .limit(1);

    return {
      valid: true,
      enrollment,
      user: user || undefined,
      course: course || undefined,
    };
  }

  /**
   * Get certificate download URL
   */
  async getCertificateUrl(certificateId: string): Promise<string | null> {
    const verification = await this.verifyCertificate(certificateId);
    if (!verification.valid || !verification.enrollment) {
      return null;
    }

    return `/api/v1/lms/certificates/${certificateId}/download`;
  }

  /**
   * Send certificate via email
   */
  async sendCertificateEmail(userId: number, certificateId: string): Promise<void> {
    const verification = await this.verifyCertificate(certificateId);
    if (!verification.valid || !verification.user) {
      throw new NotFoundException('Certificate not found or invalid');
    }

    // Get certificate file path
    const parts = certificateId.split('-');
    const enrollmentId = parseInt(parts[1]);
    const certificatePath = await this.getCertificatePDFPath(enrollmentId);

    if (!certificatePath) {
      throw new NotFoundException('Certificate file not found');
    }

    // Read certificate file
    const certificateBuffer = readFileSync(certificatePath);

    // TODO: Integrate with email service to send certificate
    // This would typically use a service like SendGrid, AWS SES, or similar
    // For now, we'll just log it
    this.logger.log(`Certificate email would be sent to ${verification.user.email}`);
    this.logger.log(`Certificate file: ${certificatePath}`);

    // Example email integration (commented out):
    // await this.emailService.sendEmail({
    //   to: verification.user.email,
    //   subject: 'Your Course Completion Certificate',
    //   text: 'Congratulations on completing the course!',
    //   attachments: [{
    //     filename: 'certificate.pdf',
    //     content: certificateBuffer,
    //   }],
    // });
  }
}

import { Controller, Get, Post, Param, UseGuards, ParseIntPipe, Res, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CertificatesService } from './certificates.service';
import { createReadStream } from 'fs';
import { existsSync } from 'fs';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('lms/certificates')
@Controller('lms/certificates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get(':enrollmentId/download')
  @ApiOperation({ summary: 'Download certificate PDF' })
  @ApiResponse({ status: 200, description: 'Certificate PDF file' })
  @ApiResponse({ status: 404, description: 'Certificate not found' })
  async downloadCertificate(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @Res() res: Response,
  ) {
    const filePath = await this.certificatesService.getCertificatePDFPath(enrollmentId);
    
    if (!filePath || !existsSync(filePath)) {
      throw new NotFoundException('Certificate not found. Please generate it first.');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${enrollmentId}.pdf"`);
    
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Get(':enrollmentId/generate')
  @ApiOperation({ summary: 'Generate certificate PDF (by enrollment ID)' })
  @ApiResponse({ status: 200, description: 'Certificate generated successfully' })
  @ApiResponse({ status: 404, description: 'Enrollment not found or course not completed' })
  async generateCertificateByEnrollment(@Param('enrollmentId', ParseIntPipe) enrollmentId: number) {
    const result = await this.certificatesService.generateCertificatePDF(enrollmentId);
    return {
      message: 'Certificate generated successfully',
      downloadUrl: result.downloadUrl,
      enrollmentId,
    };
  }

  @Post('generate/:courseId')
  @ApiOperation({ summary: 'Generate certificate for current user and course' })
  @ApiResponse({ status: 201, description: 'Certificate generated successfully' })
  @ApiResponse({ status: 400, description: 'Course not completed' })
  @ApiResponse({ status: 404, description: 'Course or enrollment not found' })
  async generateCertificate(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: any,
  ) {
    const userId = user.userId || user.sub || user.id;
    const result = await this.certificatesService.generateCertificate(userId, courseId);
    return {
      message: 'Certificate generated successfully',
      ...result,
    };
  }

  @Get(':id/verify')
  @ApiOperation({ summary: 'Verify certificate authenticity' })
  @ApiResponse({ status: 200, description: 'Certificate verification result' })
  async verifyCertificate(@Param('id') certificateId: string) {
    const verification = await this.certificatesService.verifyCertificate(certificateId);
    return verification;
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download certificate PDF by certificate ID' })
  @ApiResponse({ status: 200, description: 'Certificate PDF file' })
  @ApiResponse({ status: 404, description: 'Certificate not found' })
  async downloadCertificateById(
    @Param('id') certificateId: string,
    @Res() res: Response,
  ) {
    const verification = await this.certificatesService.verifyCertificate(certificateId);
    
    if (!verification.valid || !verification.enrollment) {
      throw new NotFoundException('Certificate not found or invalid');
    }

    const parts = certificateId.split('-');
    const enrollmentId = parseInt(parts[1]);
    const filePath = await this.certificatesService.getCertificatePDFPath(enrollmentId);
    
    if (!filePath || !existsSync(filePath)) {
      throw new NotFoundException('Certificate file not found');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificateId}.pdf"`);
    
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }
}

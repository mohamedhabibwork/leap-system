import { Controller, Get, Param, UseGuards, ParseIntPipe, Res, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CertificatesService } from './certificates.service';
import { createReadStream } from 'fs';
import { existsSync } from 'fs';

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
  @ApiOperation({ summary: 'Generate certificate PDF' })
  @ApiResponse({ status: 200, description: 'Certificate generated successfully' })
  @ApiResponse({ status: 404, description: 'Enrollment not found or course not completed' })
  async generateCertificate(@Param('enrollmentId', ParseIntPipe) enrollmentId: number) {
    const result = await this.certificatesService.generateCertificatePDF(enrollmentId);
    return {
      message: 'Certificate generated successfully',
      downloadUrl: result.downloadUrl,
      enrollmentId,
    };
  }
}

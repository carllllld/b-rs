import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export class PDFGenerator {
  async generateOptimizedCV(cvData: any): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();

    // Use standard fonts for ATS compatibility
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let yPosition = height - 50;
    const margin = 50;
    const lineHeight = 15;

    // Helper function to draw text
    const drawText = (text: string, fontSize: number, font: any, color = rgb(0, 0, 0)) => {
      page.drawText(text, {
        x: margin,
        y: yPosition,
        size: fontSize,
        font,
        color,
      });
      yPosition -= fontSize + 5;
    };

    // Helper function to draw wrapped text
    const drawWrappedText = (text: string, fontSize: number, font: any, maxWidth: number) => {
      const words = text.split(' ');
      let line = '';
      
      for (const word of words) {
        const testLine = line + word + ' ';
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth > maxWidth && line !== '') {
          page.drawText(line, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight;
          line = word + ' ';
        } else {
          line = testLine;
        }
      }
      
      if (line !== '') {
        page.drawText(line, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight;
      }
    };

    // Contact Information
    drawText(cvData.contactInfo.name, 18, boldFont);
    drawText(`${cvData.contactInfo.email} | ${cvData.contactInfo.phone}`, 10, regularFont);
    drawText(cvData.contactInfo.location, 10, regularFont);
    yPosition -= 10;

    // Professional Summary
    drawText('PROFESSIONAL SUMMARY', 12, boldFont, rgb(0.2, 0.2, 0.2));
    yPosition -= 5;
    drawWrappedText(cvData.summary, 10, regularFont, width - 2 * margin);
    yPosition -= 10;

    // Experience
    drawText('PROFESSIONAL EXPERIENCE', 12, boldFont, rgb(0.2, 0.2, 0.2));
    yPosition -= 5;

    for (const exp of cvData.experience) {
      drawText(`${exp.title} - ${exp.company}`, 11, boldFont);
      drawText(exp.dates, 9, regularFont);
      yPosition -= 5;

      for (const bullet of exp.bullets) {
        page.drawText('•', {
          x: margin,
          y: yPosition,
          size: 10,
          font: regularFont,
        });
        
        drawWrappedText(bullet, 10, regularFont, width - 2 * margin - 15);
      }
      yPosition -= 10;
    }

    // Skills
    drawText('SKILLS', 12, boldFont, rgb(0.2, 0.2, 0.2));
    yPosition -= 5;
    
    const technicalSkills = cvData.skills.technical.join(' • ');
    drawWrappedText(`Technical: ${technicalSkills}`, 10, regularFont, width - 2 * margin);
    yPosition -= 5;
    
    const softSkills = cvData.skills.soft.join(' • ');
    drawWrappedText(`Professional: ${softSkills}`, 10, regularFont, width - 2 * margin);
    yPosition -= 10;

    // Education
    drawText('EDUCATION', 12, boldFont, rgb(0.2, 0.2, 0.2));
    yPosition -= 5;

    for (const edu of cvData.education) {
      drawText(`${edu.degree} - ${edu.institution}`, 10, regularFont);
      drawText(edu.year, 9, regularFont);
      yPosition -= 10;
    }

    // Add metadata for ATS
    pdfDoc.setTitle(cvData.contactInfo.name + ' - Resume');
    pdfDoc.setAuthor(cvData.contactInfo.name);
    pdfDoc.setSubject('Professional Resume');
    pdfDoc.setKeywords(cvData.skills.technical.concat(cvData.skills.soft));

    return await pdfDoc.save();
  }

  async uploadToSupabase(pdfBytes: Uint8Array, userId: string, cvVersionId: string): Promise<string> {
    const { supabase } = await import('@/lib/supabase/client');
    
    const fileName = `${userId}/${cvVersionId}/optimized-cv.pdf`;
    
    const { data, error } = await supabase.storage
      .from('cv-files')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) {
      throw new Error('Failed to upload PDF: ' + error.message);
    }

    const { data: urlData } = supabase.storage
      .from('cv-files')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }
}

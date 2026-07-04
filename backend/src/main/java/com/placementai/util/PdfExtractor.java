package com.placementai.util;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class PdfExtractor {

    public String extractText(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();

        if (originalFilename != null && originalFilename.toLowerCase().endsWith(".pdf")) {
            try (PDDocument document = org.apache.pdfbox.Loader.loadPDF(file.getBytes())) {
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(document);
            }
        } else {
            // Try reading as plain text (txt or docx-as-text)
            return new String(file.getBytes(), StandardCharsets.UTF_8);
        }
    }
}

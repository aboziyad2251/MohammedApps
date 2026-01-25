import { jsPDF } from "jspdf";
import { StudentInfo, ExamResult, AnalysisFeedback, ExamMetadata, Language } from "../types";
import { translations } from "../locales";

export const generatePDFReport = (
  student: StudentInfo,
  result: ExamResult,
  metadata: ExamMetadata,
  analysis: AnalysisFeedback,
  lang: Language
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;
  
  const t = translations[lang].results;
  const tPdf = translations[lang].pdf;
  
  // Note: jsPDF standard fonts do not support Arabic characters.
  // Real-world implementation would require loading a custom font (e.g., Cairo, Amiri)
  // For now, we will use English labels if the content is in English, 
  // but if the user is in Arabic, we will attempt to print, though it may require a font plugin.
  // To prevent complete breakage, we will default to English labels for the structure
  // if strict Arabic font support isn't available in this environment, 
  // but we will use the translated values passed in.
  
  // Title
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("Exam Performance Report", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // Course & Student Info
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`Course: ${metadata.courseName}`, 20, yPos);
  yPos += 7;
  doc.text(`Student: ${student.name} (ID: ${student.id})`, 20, yPos);
  yPos += 7;
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPos);
  yPos += 15;

  // Score Summary
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos - 5, pageWidth - 20, yPos - 5);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`Final Score: ${result.scorePercentage.toFixed(1)}%`, 20, yPos);
  
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  const correctText = `Correct: ${result.correctCount}`;
  const wrongText = `Incorrect: ${result.incorrectCount}`;
  const totalText = `Total: ${result.totalQuestions}`;
  
  yPos += 8;
  doc.text(`${correctText}   |   ${wrongText}   |   ${totalText}`, 20, yPos);
  yPos += 15;

  doc.line(20, yPos - 5, pageWidth - 20, yPos - 5);

  // General Feedback
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("General Feedback", 20, yPos);
  yPos += 8;
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  
  // Split text logic handles basic latin text wrapping. 
  const splitFeedback = doc.splitTextToSize(analysis.generalFeedback, pageWidth - 40);
  doc.text(splitFeedback, 20, yPos);
  yPos += (splitFeedback.length * 5) + 10;

  // Strengths
  if (yPos > 250) { doc.addPage(); yPos = 20; }
  doc.setFontSize(14);
  doc.setTextColor(22, 163, 74); // Green
  doc.text("Strengths", 20, yPos);
  yPos += 8;
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  analysis.strengths.forEach((point) => {
    doc.text(`• ${point}`, 25, yPos);
    yPos += 6;
  });
  yPos += 5;

  // Weaknesses
  if (yPos > 250) { doc.addPage(); yPos = 20; }
  doc.setFontSize(14);
  doc.setTextColor(220, 38, 38); // Red
  doc.text("Areas for Improvement", 20, yPos);
  yPos += 8;
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  analysis.weaknesses.forEach((point) => {
    doc.text(`• ${point}`, 25, yPos);
    yPos += 6;
  });
  yPos += 5;

  // Recommendations
  if (yPos > 250) { doc.addPage(); yPos = 20; }
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235); // Blue
  doc.text("Study Recommendations", 20, yPos);
  yPos += 8;
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  analysis.recommendations.forEach((point) => {
    doc.text(`• ${point}`, 25, yPos);
    yPos += 6;
  });
  yPos += 15;

  // Detailed Questions Review
  doc.addPage(); 
  yPos = 20;

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(tPdf.reportTitle, pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  result.questions.forEach((q, index) => {
      // Check page break with some buffer for content
      if (yPos > 250) {
          doc.addPage();
          yPos = 20;
      }

      const userAnswer = result.answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      const statusText = isCorrect ? `(${tPdf.correct})` : `(${tPdf.incorrect})`;
      
      // Question Text
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const questionTitle = `Q${index + 1}. ${q.text}`;
      const splitQuestion = doc.splitTextToSize(questionTitle, pageWidth - 40);
      doc.text(splitQuestion, 20, yPos);
      yPos += (splitQuestion.length * 5) + 3;

      // User Answer
      doc.setFontSize(10);
      if (isCorrect) {
          doc.setTextColor(22, 163, 74); // Green
      } else {
          doc.setTextColor(220, 38, 38); // Red
      }
      const userAnswerText = userAnswer ? userAnswer : '-';
      const userAnswerLine = `${tPdf.yourAnswer}: ${userAnswerText} ${statusText}`;
      const splitUserAnswer = doc.splitTextToSize(userAnswerLine, pageWidth - 40);
      doc.text(splitUserAnswer, 25, yPos);
      yPos += (splitUserAnswer.length * 5) + 2;

      // Correct Answer - ALWAYS Show
      doc.setTextColor(60, 60, 60); // Dark Gray
      const correctAnswerLine = `${tPdf.correctAnswer}: ${q.correctAnswer}`;
      const splitCorrect = doc.splitTextToSize(correctAnswerLine, pageWidth - 40);
      doc.text(splitCorrect, 25, yPos);
      yPos += (splitCorrect.length * 5) + 2;

      yPos += 5; // Spacing between questions
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
    doc.text("Generated by Techarja Exam Builder", 20, 290);
  }

  doc.save(`ExamReport_${student.name.replace(/\s+/g, '_')}.pdf`);
};

import { Language } from './types';

export const translations = {
  en: {
    appTitle: "Techarja Exam Builder",
    footerText: "Techarja Exam Builder. Powered by Google Gemini & Veo.",
    uploadStep: {
      title: "Transform PDFs into Exams",
      subtitle: "Upload your course material and let AI generate a comprehensive assessment, complete with grading and detailed performance analytics.",
      dragDrop: "Drag and drop your file here, or click buttons below",
      processing: "Processing PDF...",
      uploadBtn: "Upload Course PDF",
      selectBtn: "Select PDF File",
      explainBtn: "Explain The Book",
      createExamBtn: "Exam Creation",
      errorType: "Please upload a valid PDF file.",
      errorSize: "File size too large (max 100MB).",
      errorProcess: "Failed to process file. Please try again.",
      levelLabel: "Education Level",
      difficultyLabel: "Exam Difficulty",
      levels: {
        primary: "Primary School",
        intermediate: "Intermediate School",
        secondary: "Secondary School",
        university: "University Level"
      },
      difficulties: {
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
        tricky: "Tricky"
      }
    },
    explanation: {
      title: "Book Explanation",
      summary: "General Overview",
      chaptersTitle: "Chapter Revision Guide",
      chapterKeyPoints: "Key Concepts & Formulas",
      examTips: "Critical Exam Focus",
      proceedBtn: "Proceed to Exam",
      uploadAnotherBtn: "Upload Another File",
      generateVideo: "Generate AI Video Summary"
    },
    videoGen: {
      activate: "Enable Video Features",
      activateDesc: "To generate AI videos, you need to select an API key from a paid GCP project.",
      billingLink: "Learn about billing",
      generating: "Creating your AI video...",
      step1: "Analyzing key concepts...",
      step2: "Drafting visual storyboard...",
      step3: "Rendering cinematic frames...",
      step4: "Finalizing AI video summary...",
      success: "Video Ready!",
      error: "Video generation failed. Please try again.",
      promptPrefix: "A cinematic, educational animation summarizing: ",
      resultsPrompt: "A futuristic data visualization showing a student achieving success in their exam for ",
      conceptPrompt: "A high-quality educational explainer animation about "
    },
    studentForm: {
      title: "Start Your Exam",
      courseLabel: "Course",
      nameLabel: "Full Name",
      idLabel: "Student ID",
      namePlaceholder: "Enter your full name",
      idPlaceholder: "Enter your student ID",
      submitBtn: "Begin Exam",
      timerLabel: "Self Challenge Timer",
      timerOn: "ON",
      timerOff: "OFF",
      durationLabel: "Duration (Minutes)",
      durationPlaceholder: "1 - 300"
    },
    examRunner: {
      questionLabel: "Question",
      ofLabel: "of",
      completedLabel: "Completed",
      prevBtn: "Previous",
      nextBtn: "Next",
      finishBtn: "Finish Exam",
      confirmTitle: "Ready to Submit?",
      confirmText: "You have answered",
      warningText: "Warning: You have unanswered questions.",
      reviewBtn: "Review Answers",
      submitBtn: "Submit Exam",
      timeRemaining: "Time Remaining",
      timesUp: "Time's Up! Submitting...",
      feedbackCorrect: "Correct Answer!",
      feedbackIncorrect: "Incorrect Answer",
      correctAnswerIs: "The correct answer is:",
      quitBtn: "Quit Exam"
    },
    results: {
      title: "Exam Results",
      studentLabel: "Student",
      courseLabel: "Course",
      scoreLabel: "Score",
      topicPerf: "Topic Performance",
      quickStats: "Quick Stats",
      correctLabel: "Correct Answers",
      incorrectLabel: "Incorrect Answers",
      analysisTitle: "AI Analysis",
      strengths: "Strengths",
      weaknesses: "Weaknesses",
      recommendations: "Recommendations",
      downloadBtn: "Download PDF Report",
      restartBtn: "Start New Exam",
      generateVideo: "Generate Performance Summary Video"
    },
    loading: {
      generating: "Analyzing PDF & Generating Content...",
      processing: "Calculating Score & Analyzing Performance...",
      explaining: "Analyzing Book Content..."
    },
    common: {
      quitConfirm: "Are you sure you want to quit the current exam session? All progress will be lost."
    },
    pdf: {
      reportTitle: "Detailed Question Review",
      yourAnswer: "Your Answer",
      correctAnswer: "Correct Answer",
      correct: "Correct",
      incorrect: "Incorrect"
    }
  },
  ar: {
    appTitle: "منشئ الاختبارات تيك-أرجا",
    footerText: "منشئ الاختبارات تيك-أرجا. مدعوم بواسطة Google Gemini و Veo.",
    uploadStep: {
      title: "حول ملفات PDF إلى اختبارات",
      subtitle: "قم بتحميل المواد الدراسية وسيقوم الذكاء الاصطناعي بإنشاء تقييم شامل، مع التصحيح وتحليلات الأداء التفصيلية.",
      dragDrop: "اسحب الملف هنا، أو انقر على الأزرار أدناه",
      processing: "جارٍ معالجة الملف...",
      uploadBtn: "تحميل ملف الدورة",
      selectBtn: "اختر ملف PDF",
      explainBtn: "شرح الكتاب",
      createExamBtn: "إنشاء اختبار",
      errorType: "يرجى تحميل ملف PDF صالح.",
      errorSize: "حجم الملف كبير جداً (الحد الأقصى 100 ميجابايت).",
      errorProcess: "فشلت معالجة الملف. يرجى المحاولة مرة أخرى.",
      levelLabel: "المستوى التعليمي",
      difficultyLabel: "مستوى صعوبة الاختبار",
      levels: {
        primary: "المدرسة الابتدائية",
        intermediate: "المدرسة المتوسطة",
        secondary: "المدرسة الثانوية",
        university: "المستوى الجامعي"
      },
      difficulties: {
        easy: "سهل",
        medium: "متوسط",
        hard: "صعب",
        tricky: "مخادع"
      }
    },
    explanation: {
      title: "شرح الكتاب",
      summary: "نظرة عامة",
      chaptersTitle: "دليل مراجعة الفصول",
      chapterKeyPoints: "المفاهيم الأساسية والقوانين",
      examTips: "تركيز الاختبار الحاسم",
      proceedBtn: "متابعة للاختبار",
      uploadAnotherBtn: "تحميل ملف آخر",
      generateVideo: "إنشاء ملخص فيديو بالذكاء الاصطناعي"
    },
    videoGen: {
      activate: "تفعيل ميزات الفيديو",
      activateDesc: "لإنشاء فيديوهات بالذكاء الاصطناعي، يجب اختيار مفتاح API من مشروع مدفوع في GCP.",
      billingLink: "تعرف على الفوترة",
      generating: "جارٍ إنشاء فيديو الذكاء الاصطناعي...",
      step1: "تحليل المفاهيم الأساسية...",
      step2: "صياغة لوحة القصة المرئية...",
      step3: "رسم الإطارات السينمائية...",
      step4: "اللمسات الأخيرة للملخص...",
      success: "الفيديو جاهز!",
      error: "فشل إنشاء الفيديو. يرجى المحاولة مرة أخرى.",
      promptPrefix: "رسوم متحركة تعليمية سينمائية تلخص: ",
      resultsPrompt: "تصوير مرئي مستقبلي للبيانات يظهر نجاح الطالب في اختباره لـ ",
      conceptPrompt: "رسوم متحركة تعليمية عالية الجودة حول "
    },
    studentForm: {
      title: "ابدأ الاختبار",
      courseLabel: "الدورة",
      nameLabel: "الاسم الكامل",
      idLabel: "الرقم الجامعي",
      namePlaceholder: "أدخل اسمك الكامل",
      idPlaceholder: "أدخل رقمك الجامعي",
      submitBtn: "ابدأ الاختبار",
      timerLabel: "مؤقت التحدي الذاتي",
      timerOn: "تشغيل",
      timerOff: "إيقاف",
      durationLabel: "المدة (بالدقائق)",
      durationPlaceholder: "1 - 300"
    },
    examRunner: {
      questionLabel: "السؤال",
      ofLabel: "من",
      completedLabel: "مكتمل",
      prevBtn: "السابق",
      nextBtn: "التالي",
      finishBtn: "إنهاء الاختبار",
      confirmTitle: "هل أنت مستعد للإرسال؟",
      confirmText: "لقد أجبت على",
      warningText: "تنبيه: لديك أسئلة غير مجابة.",
      reviewBtn: "مراجعة الإجابات",
      submitBtn: "إرسال الاختبار",
      timeRemaining: "الوقت المتبقي",
      timesUp: "انتهى الوقت! جارٍ الإرسال...",
      feedbackCorrect: "إجابة صحيحة!",
      feedbackIncorrect: "إجابة خاطئة",
      correctAnswerIs: "الإجابة الصحيحة هي:",
      quitBtn: "إنهاء الاختبار"
    },
    results: {
      title: "نتائج الاختبار",
      studentLabel: "الطالب",
      courseLabel: "الدورة",
      scoreLabel: "النتيجة",
      topicPerf: "أداء المواضيع",
      quickStats: "إحصائيات سريعة",
      correctLabel: "إجابات صحيحة",
      incorrectLabel: "إجابات خاطئة",
      analysisTitle: "تحليل الذكاء الاصطناعي",
      strengths: "نقاط القوة",
      weaknesses: "نقاط الضعف",
      recommendations: "التوصيات",
      downloadBtn: "تحميل التقرير PDF",
      restartBtn: "بدء اختبار جديد",
      generateVideo: "إنشاء فيديو ملخص للأداء"
    },
    loading: {
      generating: "جارٍ تحليل الملف وإنشاء الأسئلة...",
      processing: "جارٍ حساب النتيجة وتحليل الأداء...",
      explaining: "جارٍ تحليل محتوى الكتاب..."
    },
    common: {
      quitConfirm: "هل أنت متأكد من رغبتك في إنهاء الجلسة الحالية؟ سيتم فقدان جميع البيانات."
    },
    pdf: {
      reportTitle: "مراجعة تفصيلية للأسئلة",
      yourAnswer: "إجابتك",
      correctAnswer: "الإجابة الصحيحة",
      correct: "صحيح",
      incorrect: "خاطئ"
    }
  }
};

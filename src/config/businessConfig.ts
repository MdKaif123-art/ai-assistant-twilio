export interface BusinessConfig {
  name: string;
  industry: string;
  description: string;
  services: string[];
  contactInfo: {
    phone: string;
    email: string;
    website: string;
    address: string;
  };
  policies: {
    returnPolicy: string;
    warrantyPolicy: string;
    shippingPolicy: string;
  };
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

export const businessConfig: BusinessConfig = {
  name: "MediCare Health Solutions",
  industry: "Healthcare Management and Medical Services",
  description: "We are a comprehensive healthcare management system providing patient care, medical consultations, appointment scheduling, and health monitoring services. Our AI-powered system ensures 24/7 medical support and efficient healthcare delivery.",
  services: [
    "Patient Registration and Management",
    "Appointment Scheduling and Reminders",
    "Medical Consultation and Triage",
    "Health Records Management",
    "Prescription Management",
    "Lab Results and Reports",
    "Emergency Medical Support",
    "Health Monitoring and Alerts",
    "Insurance and Billing Services",
    "Telemedicine Consultations",
    "Medical Device Integration",
    "Health Analytics and Reporting"
  ],
  contactInfo: {
    phone: "+1-555-MEDICARE",
    email: "support@medicare.com",
    website: "www.medicare.com",
    address: "123 Healthcare Drive, Medical Center, MC 12345"
  },
  policies: {
    returnPolicy: "Medical services are non-refundable. Prescription medications cannot be returned for safety reasons. Medical devices may be returned within 30 days if unused and in original packaging.",
    warrantyPolicy: "All medical devices come with manufacturer warranty. Our healthcare services are covered by medical malpractice insurance. Software systems have 99.9% uptime guarantee.",
    shippingPolicy: "Emergency medications are delivered within 2 hours. Regular prescriptions ship within 24 hours. Medical devices ship within 3-5 business days with tracking."
  },
  faq: [
    {
      question: "How do I schedule an appointment?",
      answer: "You can schedule appointments through our AI assistant, website, or by calling our support line. We offer same-day appointments for urgent care and advance booking for routine checkups."
    },
    {
      question: "What insurance plans do you accept?",
      answer: "We accept most major insurance plans including Medicare, Medicaid, Blue Cross Blue Shield, Aetna, and Cigna. We also offer self-pay options and payment plans for uninsured patients."
    },
    {
      question: "How do I access my medical records?",
      answer: "Your medical records are securely stored and accessible through our patient portal. You can view test results, prescriptions, and appointment history 24/7. For urgent access, contact our support team."
    },
    {
      question: "What should I do in a medical emergency?",
      answer: "In case of a medical emergency, call 911 immediately. Our AI system can provide initial guidance, but always seek professional emergency care for serious conditions."
    },
    {
      question: "How do I refill my prescription?",
      answer: "You can request prescription refills through our AI assistant, patient portal, or by calling our pharmacy. Most refills are processed within 24 hours and can be delivered or picked up."
    },
    {
      question: "Do you offer telemedicine services?",
      answer: "Yes, we offer comprehensive telemedicine services including video consultations, remote monitoring, and virtual follow-ups. This is especially useful for routine checkups and non-emergency consultations."
    }
  ]
};

export const OPENAI_CONFIG = {
  // OpenRouter API key
  apiKey: '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',
  model: 'gpt-3.5-turbo',
  maxTokens: 500,
  temperature: 0.7
}; 
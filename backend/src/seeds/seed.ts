import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Faq } from '../faq/entities/faq.entity';

const seedData = [
  {
    question: "What are your clinic operating hours?",
    answer: "Our clinic is open Monday to Friday from 8:00 AM to 6:00 PM, and Saturday from 8:00 AM to 2:00 PM. We are closed on Sundays and public holidays. For emergency cases outside operating hours, please visit the nearest hospital emergency department.",
    tags: ["hours"],
    lang: "en"
  },
  {
    question: "Are you open during public holidays in Malaysia?",
    answer: "We are closed during Malaysian public holidays including Hari Raya, Chinese New Year, Deepavali, Christmas, and National Day. However, we provide emergency contact information for urgent medical needs during these periods.",
    tags: ["hours"],
    lang: "en"
  },
  {
    question: "How can I book an appointment with the doctor?",
    answer: "You can book appointments through our WhatsApp at +60 12-345-6789, call us at +60 3-1234-5678, or visit our clinic directly. We recommend booking in advance, especially for specialist consultations. Walk-ins are welcome but may have longer waiting times.",
    tags: ["booking"],
    lang: "en"
  },
  {
    question: "Can I reschedule my appointment online?",
    answer: "Yes, you can reschedule appointments by messaging us on WhatsApp at +60 12-345-6789 or calling our clinic. Please provide at least 24 hours notice for rescheduling to avoid cancellation charges of RM 50.",
    tags: ["booking"],
    lang: "en"
  },
  {
    question: "What is your cancellation policy for appointments?",
    answer: "Appointments can be cancelled free of charge with 24 hours advance notice. Cancellations with less than 24 hours notice or no-shows will incur a RM 50 cancellation fee. Emergency situations are considered case-by-case.",
    tags: ["booking"],
    lang: "en"
  },
  {
    question: "Where is your clinic located and how do I get there?",
    answer: "We are located at 123 Jalan Bukit Bintang, Kuala Lumpur 55100, Malaysia. We are accessible by LRT (Bukit Bintang station, 5 minutes walk) and multiple bus routes. Grab and taxi services are readily available to our location.",
    tags: ["location"],
    lang: "en"
  },
  {
    question: "Do you provide parking facilities?",
    answer: "Yes, we have 20 dedicated parking spaces for patients. Parking is free for the first 2 hours with validation from our reception. Additional hours are charged at RM 3 per hour. Street parking is also available nearby.",
    tags: ["location"],
    lang: "en"
  },
  {
    question: "What COVID-19 vaccines do you offer?",
    answer: "We provide Pfizer-BioNTech, Sinovac, and AstraZeneca COVID-19 vaccines. All vaccines are approved by the Malaysian Ministry of Health. Please bring your MySejahtera app and IC for vaccination registration.",
    tags: ["services", "vaccinations"],
    lang: "en"
  },
  {
    question: "Do you provide travel vaccinations?",
    answer: "Yes, we offer comprehensive travel vaccination services including Hepatitis A/B, Typhoid, Japanese Encephalitis, and Yellow Fever vaccines. Please book a consultation at least 4-6 weeks before travel for proper vaccination scheduling.",
    tags: ["services", "vaccinations"],
    lang: "en"
  },
  {
    question: "What childhood vaccines do you provide?",
    answer: "We follow the Malaysian National Immunisation Programme schedule, providing vaccines for Hepatitis B, DTP, Polio, Hib, MMR, and others. We also offer optional vaccines like Pneumococcal, Rotavirus, and Chickenpox vaccines.",
    tags: ["services", "vaccinations"],
    lang: "en"
  },
  {
    question: "Do you accept insurance and what are your payment methods?",
    answer: "We accept major Malaysian insurance panels including Great Eastern, Allianz, AIA, and Prudential. Payment methods include cash, credit/debit cards, online banking, and medical insurance direct billing for panel patients.",
    tags: ["billing"],
    lang: "en"
  },
  {
    question: "How much does a general consultation cost?",
    answer: "General consultations start from RM 80 for adults and RM 60 for children under 12. Specialist consultations range from RM 150-300 depending on the specialty. Medical certificate issuance is RM 20. Prices may vary for complex cases.",
    tags: ["billing"],
    lang: "en"
  },
  {
    question: "Can I get a medical certificate and how much does it cost?",
    answer: "Yes, we can issue medical certificates for sick leave, fitness for work, or travel purposes. The cost is RM 20 for standard MC and RM 50 for detailed medical reports. Same-day issuance is available for urgent needs.",
    tags: ["billing"],
    lang: "en"
  },
  {
    question: "What are your WhatsApp support hours?",
    answer: "Our WhatsApp support (+60 12-345-6789) is available Monday to Friday from 8:30 AM to 5:30 PM, and Saturday from 8:30 AM to 1:30 PM. We respond to messages within 30 minutes during business hours. For after-hours emergencies, please call our clinic or visit the hospital.",
    tags: ["support"],
    lang: "en"
  },
  {
    question: "Can I get test results and prescriptions through WhatsApp?",
    answer: "For privacy and security reasons, we cannot share detailed test results or prescription information via WhatsApp. However, you can use WhatsApp to inquire about result availability, prescription refills, and schedule follow-up appointments. Detailed results must be collected in person or through our secure patient portal.",
    tags: ["support"],
    lang: "en"
  }
];

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/faq_db',
    entities: [Faq],
    synchronize: true,
    logging: false,
  });

  try {
    console.log('Initializing database connection...');
    await dataSource.initialize();
    console.log('Data Source has been initialized!');

    const faqRepository = dataSource.getRepository(Faq);
    
    // Clear existing data
    console.log('Clearing existing FAQs...');
    await faqRepository.clear();
    console.log('Cleared existing FAQs');

    // Insert seed data
    console.log('Seeding FAQs...');
    for (const data of seedData) {
      const faq = faqRepository.create(data);
      await faqRepository.save(faq);
      console.log(`✓ Seeded: ${data.question.substring(0, 60)}...`);
    }

    console.log(`\n🎉 Database seeding completed successfully! Added ${seedData.length} FAQs.`);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Database connection closed.');
    }
  }
}

if (require.main === module) {
  seed();
}

export default seed;
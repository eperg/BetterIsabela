/**
 * The FAQ, as question-and-answer pairs.
 *
 * This is kept separate from LEGAL_CONTENT because the FAQ is not prose: each
 * answer belongs to a question, and losing that pairing is what happened in the
 * first migration — the answers survived, the questions did not. Questions are
 * restored here verbatim from the legacy /faq/index.html accordions.
 *
 * The pairing is also what makes the page eligible for FAQPage structured data,
 * which is how answer engines quote a single answer with attribution.
 */
import type { Block } from './legal-content';

/** Answers are prose only: paragraphs and list items, no headings. */
export type AnswerBlock = ['p' | 'li', string];

export interface FaqEntry {
  question: string;
  answer: AnswerBlock[];
}

export interface FaqCategory {
  name: string;
  /** Bootstrap Icons class, matching the legacy page. */
  icon: string;
  entries: FaqEntry[];
}

export const FAQ_LEAD = 'Find answers to common questions about provincial services.';

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    name: 'General Questions',
    icon: 'bi-info-circle-fill',
    entries: [
      {
        question: 'What are the office hours of the Provincial Capitol?',
        answer: [
          [
            'p',
            'The Provincial Capitol is open Monday to Friday, 8:00 AM to 5:00 PM, with a lunch break from 12:00 PM to 1:00 PM. We are closed on weekends and national/local holidays.',
          ],
        ],
      },
      {
        question: 'How can I contact a specific provincial office?',
        answer: [
          [
            'p',
            'Visit our Government Directory page to find contact information for all provincial offices and department heads.',
          ],
        ],
      },
      {
        question: 'Can I request services online?',
        answer: [
          [
            'p',
            'Currently, most services require in-person applications. However, we are working on implementing online services for select transactions. Check individual service pages for updates.',
          ],
        ],
      },
    ],
  },
  {
    name: 'Certificates & Documents',
    icon: 'bi-file-earmark-text-fill',
    entries: [
      {
        question: 'How long does it take to get a birth certificate?',
        answer: [
          [
            'p',
            'For birth certificates registered in Isabela, it typically takes 15-30 minutes while you wait, provided the record is readily available.',
          ],
        ],
      },
      {
        question: 'Can someone else request my certificate for me?',
        answer: [
          ['p', 'Yes, but they must bring:'],
          ['li', 'An authorization letter signed by you'],
          ['li', 'Valid ID of both you and the representative'],
          ['li', 'Photocopy of your valid ID'],
        ],
      },
      {
        question: 'What is the difference between PSA and local civil registrar certificates?',
        answer: [
          [
            'p',
            'Both are certified true copies. PSA certificates are the nationally-recognized version required for passport and visa applications. Local civil registrar certificates are accepted for most local transactions and are often processed faster.',
          ],
        ],
      },
    ],
  },
  {
    name: 'Business & Permits',
    icon: 'bi-shop',
    entries: [
      {
        question: 'When should I renew my business permit?',
        answer: [
          [
            'p',
            'Business permits must be renewed annually, preferably in January. The deadline for penalty-free renewal is typically January 20th of each year.',
          ],
        ],
      },
      {
        question: 'What do I need to start a new business in Isabela?',
        answer: [
          ['p', 'To start a new business, you’ll need:'],
          ['li', 'DTI Registration (for sole proprietorship) or SEC Registration (for corporation)'],
          ['li', 'Barangay Clearance'],
          ['li', 'Community Tax Certificate (Cedula)'],
          ['li', 'Location Sketch/Map'],
          ['li', 'Contract of Lease (if renting)'],
          ['p', 'Visit our Business Permit page for complete details.'],
        ],
      },
    ],
  },
  {
    name: 'Payments & Fees',
    icon: 'bi-cash-coin',
    entries: [
      {
        question: 'What payment methods are accepted?',
        answer: [
          [
            'p',
            'Currently, we accept cash payments at the Provincial Treasurer’s Office. We are working on implementing online payment options for taxes and fees.',
          ],
        ],
      },
      {
        question: 'How can I pay my real property tax?',
        answer: [
          [
            'p',
            'Visit the Provincial Treasurer’s Office at the Provincial Capitol with your Tax Declaration or latest Official Receipt. Payment is in cash. Property taxes are due quarterly, but you may pay annually to avail of discounts.',
          ],
        ],
      },
    ],
  },
  {
    name: 'Social Services',
    icon: 'bi-people-fill',
    entries: [
      {
        question: 'How do I apply for a Senior Citizen ID?',
        answer: [
          ['p', 'Go to the Provincial Social Welfare and Development Office (PSWDO) with:'],
          ['li', 'Birth Certificate or any valid ID showing your age (60 and above)'],
          ['li', '1x1 ID photo'],
          ['li', 'Barangay Residence Certificate'],
          ['p', 'The ID is issued for free.'],
        ],
      },
      {
        question: 'What benefits do senior citizens receive?',
        answer: [
          [
            'p',
            'Senior citizens enjoy 20% discount and VAT exemption on purchases (with a minimum purchase amount per establishment), priority lanes, and access to special programs and medical assistance from the province.',
          ],
        ],
      },
    ],
  },
  {
    name: 'Technical Questions',
    icon: 'bi-gear-fill',
    entries: [
      {
        question: 'I found a broken link or error on this website. How do I report it?',
        answer: [
          [
            'p',
            'Thank you for helping us improve! Please send us a message at volunteer@betterisabela.org and write “Website Issue” as the subject. Describe the problem and include the page URL if possible.',
          ],
        ],
      },
      {
        question: 'Is this website mobile-friendly?',
        answer: [
          [
            'p',
            'Yes! Better Isabela is fully responsive and optimized for mobile phones, tablets, and desktop computers.',
          ],
        ],
      },
    ],
  },
];

/** Every question across every category, flattened for schema and search. */
export const faqEntries = (): FaqEntry[] => FAQ_CATEGORIES.flatMap((c) => c.entries);

/**
 * One answer as plain text. List items are joined with semicolons so the
 * sentence still reads as a sentence when an answer engine quotes it.
 */
export function answerText(answer: AnswerBlock[]): string {
  const parts: string[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (!bullets.length) return;
    parts.push(`${bullets.join('; ')}.`);
    bullets = [];
  };
  answer.forEach(([tag, text]) => {
    if (tag === 'li') {
      bullets.push(text);
      return;
    }
    flush();
    parts.push(text);
  });
  flush();
  return parts.join(' ');
}

/** Answer blocks widened to the shared prose Block type for <Prose>. */
export const asBlocks = (answer: AnswerBlock[]): Block[] => answer;

import type { Faq, FaqCategory } from "@/content/types";

export const faqs: Faq[] = [
  {
    id: "choose-room-or-package",
    question: "Can I book a room without a surf package?",
    answer:
      "Yes. Choose Stay Only if you want accommodation first, then mention any optional surf, transfer, breakfast, or local planning questions in the booking message.",
    categories: ["general", "booking", "packages"],
  },
  {
    id: "beginner-friendly",
    question: "Are the surf options suitable for complete beginners?",
    answer:
      "Yes. The Beginner Surf Lesson Package is written for first-time surfers and early-stage guests who need calm pacing, safety guidance, equipment support, and clear coaching.",
    categories: ["general", "packages"],
  },
  {
    id: "check-in-check-out",
    question: "What are the check-in and check-out times?",
    answer:
      "Check-in is from 14:00 and check-out is by 11:00. Guests can mention early arrival or transfer timing in the booking message.",
    categories: ["general", "rooms", "booking"],
  },
  {
    id: "group-inquiries",
    question: "Can groups, families, or small retreats send one inquiry?",
    answer:
      "Yes. The Family / Group Room and Group Surf Package are designed to capture custom group requests. Share guest count, dates, preferred room mix, and any surf needs in one message.",
    categories: ["general", "rooms", "packages", "booking"],
  },
  {
    id: "package-includes-equipment",
    question: "Do surf packages include boards and wetsuits?",
    answer:
      "The surf package examples include boards and wetsuits during coached sessions. Final confirmation can be handled directly in the inquiry reply.",
    categories: ["packages"],
  },
  {
    id: "airport-transfer-placeholder",
    question: "Can I ask about Agadir airport transfers?",
    answer:
      "Yes. The booking form message field is the right place to ask for transfer support, arrival timing, or late check-in coordination.",
    categories: ["general", "booking"],
  },
  {
    id: "payment-flow",
    question: "Is online payment active yet?",
    answer:
      "No. The current flow is inquiry, WhatsApp, and email only. Guests submit dates and preferences, then the team confirms the next step manually.",
    categories: ["general", "booking"],
  },
];

export function getFaqsByCategory(category: FaqCategory) {
  return faqs.filter((faq) => faq.categories.includes(category));
}

"use client";

import { useState } from "react";

const questions = [
  {
    question: "Is this suitable for my first mountain hike?",
    answer:
      "Yes. Choose a Beginner event and read the distance, elevation, and duration before joining. We keep the pace supportive and explain what to expect before the hike.",
  },
  {
    question: "Can I join on my own?",
    answer:
      "Absolutely. Many hikers arrive solo. Small groups, a clear introduction, and a shared pace make it easy to feel part of the group from the start.",
  },
  {
    question: "How fit do I need to be?",
    answer:
      "You do not need to be an athlete, but the difficulty rating should match your current fitness. If you are unsure, contact us and we will help you choose honestly.",
  },
  {
    question: "What should I wear and bring?",
    answer:
      "Wear hiking shoes with good grip and comfortable active clothing. Bring enough water, sun protection, and any event-specific kit shared before the hike.",
  },
  {
    question: "What happens if the weather is unsafe?",
    answer:
      "Safety comes first. Heat, rain, poor visibility, or trail conditions may require a route change or postponement. We will contact interested hikers with any update.",
  },
  {
    question: "Does tapping Join confirm my place?",
    answer:
      "Not yet. Join registers your interest without taking payment. We will contact you on WhatsApp to confirm availability and help with changes or cancellation.",
  },
] as const;

export function Faqs() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="faqs" id="faqs" aria-labelledby="faqs-title">
      <div className="faqs-inner">
        <header className="faqs-heading">
          <h2 id="faqs-title">FAQs</h2>
          <p>Clear answers for first-time hikers, solo joiners, and anyone choosing the right route.</p>
        </header>

        <div className="faq-list">
          {questions.map((item, index) => {
            const isOpen = openIndex === index;
            const answerId = `faq-answer-${index}`;

            return (
              <article className={isOpen ? "faq-item open" : "faq-item"} key={item.question}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <span>{item.question}</span>
                    <span className="faq-toggle" aria-hidden="true" />
                  </button>
                </h3>
                <div className="faq-answer" id={answerId} hidden={!isOpen}><p>{item.answer}</p></div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

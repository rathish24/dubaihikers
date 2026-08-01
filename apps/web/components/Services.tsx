import { SectionHeading } from "./ui/SectionHeading";

const services = [
  { title: "Guided group hikes", text: "Small, pace-matched groups led with clear briefings and on-trail support." },
  { title: "Private trail days", text: "A route and schedule shaped around your group, fitness, and experience." },
  { title: "Navigation skills", text: "Practical route reading, GPS basics, terrain awareness, and decision making." },
  { title: "Corporate adventures", text: "Purposeful outdoor days built around teamwork, trust, and shared challenge." },
];

export function Services() {
  return (
    <section className="services" id="services" aria-labelledby="services-title">
      <SectionHeading eyebrow="MORE THAN A WALK" headingId="services-title">
        MOVE WITH <i>CONFIDENCE.</i>
      </SectionHeading>
      <div className="service-list">
        {services.map((service) => (
          <article key={service.title}><h3>{service.title}</h3><p>{service.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

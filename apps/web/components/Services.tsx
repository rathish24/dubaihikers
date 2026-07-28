const services = [
  { number: "01", title: "Guided group hikes", text: "Small, pace-matched groups led with clear briefings and on-trail support." },
  { number: "02", title: "Private trail days", text: "A route and schedule shaped around your group, fitness, and experience." },
  { number: "03", title: "Navigation skills", text: "Practical route reading, GPS basics, terrain awareness, and decision making." },
  { number: "04", title: "Corporate adventures", text: "Purposeful outdoor days built around teamwork, trust, and shared challenge." },
];

export function Services() {
  return (
    <section className="services" id="services">
      <SectionHeading eyebrow="MORE THAN A WALK" light>
        MOVE WITH<br /><i>CONFIDENCE.</i>
      </SectionHeading>
      <div className="service-list">
        {services.map((service) => (
          <article key={service.number}>
            <span>{service.number}</span><h3>{service.title}</h3><p>{service.text}</p><b>↗</b>
          </article>
        ))}
      </div>
    </section>
  );
}
import { SectionHeading } from "./ui/SectionHeading";

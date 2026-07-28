const testimonials = [
  { quote: "I joined alone and felt part of the group before we even reached the first climb. Calm guidance, great pace, unforgettable sunrise.", name: "Maya R.", event: "Ghaf Trail" },
  { quote: "The navigation workshop changed how I read the mountains. Every decision was explained clearly, without ever slowing the adventure.", name: "Omar K.", event: "Wadi Naqab" },
  { quote: "Professional, prepared and genuinely passionate about RAK. Our private hike was the highlight of our UAE trip.", name: "Leena & Sam", event: "Hidden Oasis" },
];

export function Testimonials() {
  return (
    <section className="testimonials" id="reviews">
      <SectionHeading eyebrow="TRAIL STORIES">
        WHAT HIKERS<br /><i>BRING HOME.</i>
      </SectionHeading>
      <div className="testimonial-grid">
        {testimonials.map((item) => (
          <blockquote key={item.name}>
            <p>“{item.quote}”</p>
            <footer><strong>{item.name}</strong><small>{item.event}</small></footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
import { SectionHeading } from "./ui/SectionHeading";

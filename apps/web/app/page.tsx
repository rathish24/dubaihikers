import { Services } from "../components/Services";
import { Testimonials } from "../components/Testimonials";
import { Faqs } from "../components/Faqs";
import { SectionHeading } from "../components/ui/SectionHeading";
import { trailEvents } from "../data/trails";
import { BookingExperience } from "../features/booking/BookingExperience";

export default function Home() {
  return (
    <main>
      <BookingExperience events={trailEvents} />

      <Services />

      <section className="about-section" id="about">
        <div className="about-photo"><span>LOCAL KNOWLEDGE<br />CERTIFIED LEADERSHIP</span></div>
        <div className="about-copy">
          <p className="kicker">YOUR HIKE LEADER</p>
          <h2>RAK ISN&apos;T A<br />BACKDROP. <i>IT&apos;S HOME.</i></h2>
          <p>I guide hikers through the mountains I know best,with thoughtful planning, honest difficulty ratings, and calm decisions on the trail. Whether it is your first wadi walk or a serious summit day, the goal is the same: move safely, learn something, and come back stronger.</p>
          <div className="credentials"><span>Certified hike leader</span><span>First-aid prepared</span><span>Local route knowledge</span></div>
        </div>
      </section>

      <Testimonials />

      <section className="safety">
        <SectionHeading eyebrow="BEFORE YOU BOOK">
          THE MOUNTAIN<br />SETS THE <i>RULES.</i>
        </SectionHeading>
        <div className="safety-grid">
          <article><h3>Choose honestly</h3><p>Match the event difficulty to your current fitness and recent hiking experience.</p></article>
          <article><h3>Pack properly</h3><p>Hiking shoes, sufficient water, sun protection, and the event-specific kit are essential.</p></article>
          <article><h3>Conditions decide</h3><p>Routes may change or be postponed for heat, rain, visibility, or unsafe trail conditions.</p></article>
          <article><h3>Stay together</h3><p>Follow the leader, respect the pace, leave no trace, and never separate from the group.</p></article>
        </div>
      </section>

      <section className="final-cta" aria-labelledby="final-cta-title">
        <p className="kicker">YOUR NEXT STORY STARTS EARLY</p>
        <h2 id="final-cta-title">MEET ME<br />ON THE <i>TRAIL.</i></h2>
        <a className="cta-link" href="#events">View upcoming hikes</a>
      </section>

      <Faqs />

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <a className="brand" href="#home">
              <span className="brand-wordmark">DUBAI<span aria-hidden="true">/</span>HIKERS</span>
              <small>GUIDED MOUNTAIN HIKES</small>
            </a>
            <p>Explore responsibly. Return stronger.</p>
          </div>

          <div className="footer-column">
            <h2>Explore</h2>
            <nav aria-label="Footer navigation">
              <a href="#events">Hikes</a>
              <a href="#services">Services</a>
              <a href="#reviews">Stories</a>
            </nav>
          </div>

          <div className="footer-column footer-contact">
            <h2>Contact</h2>
            <a href="mailto:hello@dubaihikers.ae">hello@dubaihikers.ae</a>
            <p>United Arab Emirates</p>
          </div>

          <div className="footer-column footer-social">
            <h2>Social Media</h2>
            <nav aria-label="Social media">
              <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">Facebook</a>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://www.youtube.com/" target="_blank" rel="noreferrer">YouTube</a>
              <a href="https://x.com/" target="_blank" rel="noreferrer">X (Twitter)</a>
            </nav>
          </div>
        </div>

        <div className="footer-bottom">
          <small>© 2026 DUBAI HIKERS</small>
          <nav className="footer-legal" aria-label="Legal">
            <a href="/terms-and-conditions">Terms and Conditions</a>
            <a href="/privacy-policy">Privacy Policy</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}

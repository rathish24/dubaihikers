import { getGoogleReviews } from "../data/googleReviews";
import { SectionHeading } from "./ui/SectionHeading";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="review-stars" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(Math.round(rating))}
    </span>
  );
}

export async function Testimonials() {
  const summary = await getGoogleReviews();

  return (
    <section className="testimonials" id="reviews" aria-labelledby="reviews-title">
      <SectionHeading eyebrow="VERIFIED GOOGLE REVIEWS" headingId="reviews-title">
        TRAIL STORIES FROM <i>REAL HIKERS.</i>
      </SectionHeading>

      {summary ? (
        <>
          <div className="google-review-summary">
            <div>
              <span className="google-wordmark">Google</span>
              <strong>{summary.rating.toFixed(1)}</strong>
              <Stars rating={summary.rating} />
              <span>{summary.reviewCount} reviews</span>
            </div>
            <a href={summary.reviewsUrl} target="_blank" rel="noreferrer">
              Read all reviews
            </a>
          </div>

          <div className="testimonial-grid">
            {summary.reviews.map((review) => (
              <blockquote key={review.id}>
                <Stars rating={review.rating} />
                <p>“{review.text}”</p>
                <footer>
                  <strong>
                    {review.authorUrl ? (
                      <a href={review.authorUrl} target="_blank" rel="noreferrer">{review.authorName}</a>
                    ) : review.authorName}
                  </strong>
                  {review.reviewUrl ? (
                    <a href={review.reviewUrl} target="_blank" rel="noreferrer">{review.relativeDate}</a>
                  ) : <small>{review.relativeDate}</small>}
                </footer>
              </blockquote>
            ))}
          </div>

          {summary.writeReviewUrl && (
            <a className="google-review-cta" href={summary.writeReviewUrl} target="_blank" rel="noreferrer">
              Share your hike on Google
            </a>
          )}
        </>
      ) : (
        <div className="reviews-unavailable">
          <p>Our verified Google trail stories will be available here soon.</p>
        </div>
      )}
    </section>
  );
}

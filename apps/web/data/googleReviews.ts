export type GoogleReview = {
  id: string;
  authorName: string;
  authorUrl: string | null;
  rating: number;
  relativeDate: string;
  text: string;
  reviewUrl: string | null;
};

export type GoogleReviewSummary = {
  rating: number;
  reviewCount: number;
  reviewsUrl: string;
  writeReviewUrl: string | null;
  reviews: GoogleReview[];
};

type GooglePlaceResponse = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: Array<{
    name?: string;
    relativePublishTimeDescription?: string;
    text?: { text?: string };
    rating?: number;
    googleMapsUri?: string;
    authorAttribution?: {
      displayName?: string;
      uri?: string;
    };
  }>;
};

const fieldMask = [
  "rating",
  "userRatingCount",
  "googleMapsUri",
  "reviews.name",
  "reviews.relativePublishTimeDescription",
  "reviews.text",
  "reviews.rating",
  "reviews.googleMapsUri",
  "reviews.authorAttribution",
].join(",");

export async function getGoogleReviews(): Promise<GoogleReviewSummary | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return null;

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": fieldMask,
        },
        cache: "no-store",
      },
    );
    if (!response.ok) return null;

    const place = await response.json() as GooglePlaceResponse;
    if (!place.rating || !place.userRatingCount || !place.googleMapsUri) return null;

    const reviews = (place.reviews ?? [])
      .filter((review) => review.text?.text && review.authorAttribution?.displayName)
      .slice(0, 3)
      .map((review, index) => ({
        id: review.name ?? `${review.authorAttribution?.displayName}-${index}`,
        authorName: review.authorAttribution?.displayName ?? "Google reviewer",
        authorUrl: review.authorAttribution?.uri ?? null,
        rating: review.rating ?? 5,
        relativeDate: review.relativePublishTimeDescription ?? "Google review",
        text: review.text?.text ?? "",
        reviewUrl: review.googleMapsUri ?? null,
      }));

    return {
      rating: place.rating,
      reviewCount: place.userRatingCount,
      reviewsUrl: place.googleMapsUri,
      writeReviewUrl: process.env.GOOGLE_WRITE_REVIEW_URL ?? null,
      reviews,
    };
  } catch {
    return null;
  }
}

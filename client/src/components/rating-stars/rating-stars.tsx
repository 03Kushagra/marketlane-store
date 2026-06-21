import { formatRating } from "../../utils/formatters";

type RatingStarsProps = {
  rating: number;
  className?: string;
  label?: string;
};

const MAX_STARS = 5;

function getActiveStars(rating: number) {
  return Math.max(0, Math.min(MAX_STARS, Math.round(rating)));
}

export function RatingStars({
  rating,
  className = "",
  label,
}: RatingStarsProps) {
  const activeStars = getActiveStars(rating);
  const formattedRating = formatRating(rating);

  return (
    <span
      className={`rating-stars ${className}`.trim()}
      aria-label={label ?? `Rating ${formattedRating} out of ${MAX_STARS}`}
    >
      <span className="rating-stars__icons" aria-hidden="true">
        {Array.from({ length: MAX_STARS }, (_, index) => (
          <span
            className={
              index < activeStars
                ? "rating-stars__star rating-stars__star--active"
                : "rating-stars__star"
            }
            key={index}
          >
            {"\u2605"}
          </span>
        ))}
      </span>
      <span>({formattedRating})</span>
    </span>
  );
}

import { StarIcon } from "./Icons";

export default function StarRating({ rating, setRating, readOnly = false }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button" // form의 submit을 방지
          disabled={readOnly}
          onClick={() => !readOnly && setRating(star)}
          className={`cursor-${readOnly ? 'default' : 'pointer'}`}
        >
          <StarIcon isFilled={star <= rating} />
        </button>
      ))}
    </div>
  );
}
// Loading placeholder shaped like a post card.
export default function SkeletonCard() {
  return (
    <div className="skeleton glass" aria-hidden="true">
      <div className="skeleton__line skeleton__line--short" />
      <div className="skeleton__line skeleton__line--title" />
      <div className="skeleton__line" />
      <div className="skeleton__line" />
      <div className="skeleton__line skeleton__line--short" />
    </div>
  );
}

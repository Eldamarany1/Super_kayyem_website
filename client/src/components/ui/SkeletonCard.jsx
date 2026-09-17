export function SkeletonCard() {
  return (
    <div className="lib-skeleton" aria-hidden="true">
      <div className="lib-skeleton__cover" />
      <div className="lib-skeleton__body">
        <div className="lib-skeleton__line lib-skeleton__line--title" />
        <div className="lib-skeleton__line lib-skeleton__line--sub" />
        <div className="lib-skeleton__line lib-skeleton__line--btn" />
      </div>
    </div>
  );
}

export default SkeletonCard;

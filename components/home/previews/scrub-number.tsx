export default function ScrubNumberPreview() {
  return (
    <div className="scrub-card-preview scrub-animated-preview">
      <div className="scrub-preview-shape" />
      <span>
        Size{" "}
        <b className="scrub-preview-value">
          <span>↔ 48</span>
          <span>↔ 72</span>
        </b>
      </span>
      <span>
        Corners <b>↔ 18</b>
      </span>
    </div>
  );
}

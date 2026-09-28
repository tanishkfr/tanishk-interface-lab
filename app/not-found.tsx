import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell not-found">
      <p className="mono-label">404</p>
      <h1>That experiment does not exist.</h1>
      <p>
        It may have been renamed. The catalog has every current experiment.
      </p>
      <p style={{ marginTop: 24 }}>
        <Link className="chip" href="/">
          Back to the catalog
        </Link>
      </p>
    </div>
  );
}

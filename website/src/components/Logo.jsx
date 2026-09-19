export default function Logo({ className = "" }) {
  return (
    <span className={`logo ${className}`.trim()}>
      <img
        src="/images/website-logo.png"
        alt="I Love Latinas"
        width={110}
        height={110}
      />
    </span>
  );
}

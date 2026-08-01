type SectionHeadingProps = {
  eyebrow: string;
  headingId?: string;
  children: React.ReactNode;
};

export function SectionHeading({
  eyebrow,
  headingId,
  children,
}: SectionHeadingProps) {
  return (
    <div className="section-title">
      <p className="kicker">{eyebrow}</p>
      <h2 id={headingId}>{children}</h2>
    </div>
  );
}

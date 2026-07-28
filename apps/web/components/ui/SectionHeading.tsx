type SectionHeadingProps = {
  eyebrow: string;
  children: React.ReactNode;
};

export function SectionHeading({ eyebrow, children }: SectionHeadingProps) {
  return (
    <div className="section-title">
      <p className="kicker">{eyebrow}</p>
      <h2>{children}</h2>
    </div>
  );
}

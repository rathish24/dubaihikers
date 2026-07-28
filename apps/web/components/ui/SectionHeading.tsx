type SectionHeadingProps = {
  eyebrow: string;
  children: React.ReactNode;
  light?: boolean;
};

export function SectionHeading({ eyebrow, children, light = false }: SectionHeadingProps) {
  return (
    <div className={light ? "section-title light" : "section-title"}>
      <p className="kicker">{eyebrow}</p>
      <h2>{children}</h2>
    </div>
  );
}

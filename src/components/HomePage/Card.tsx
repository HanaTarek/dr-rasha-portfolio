import type { ReactNode } from "react";

export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
      {children}
    </div>
  );
}

type CardProps = {
  title: string;
  text?: string;
  items?: string[];
};

export default function Card({ title, text, items }: CardProps) {
  return (
    <div className="rounded-lg border border-s-4 border-line border-s-teal bg-bg px-[18px] py-4">
      <h3 className="mb-1.5 text-lg font-bold text-teal">{title}</h3>
      {text && <p className="text-base leading-[1.8] text-muted">{text}</p>}
      {items && (
        <ul className="list-disc ps-5">
          {items.map((item) => (
            <li key={item} className="text-base leading-[1.8] text-muted">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

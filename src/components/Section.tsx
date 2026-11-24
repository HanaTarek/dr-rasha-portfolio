import type { ReactNode } from "react";

type Props = {
  id: string;
  title: string;
  /** use the tinted background (the old `.alt` class) */
  alt?: boolean;
  /** قيمة data-sanity (وضع المعاينة فقط) لتمكين السحب والإفلات */
  dataSanity?: string;
  children: ReactNode;
};

export default function Section({ id, title, alt = false, dataSanity, children }: Props) {
  return (
    <section
      id={id}
      data-sanity={dataSanity}
      className={`border-t border-line py-12 ${alt ? "bg-surface" : ""}`}
    >
      <div className="mx-auto max-w-[1000px] px-5">
        <h2 className="mb-5 text-[28px] font-extrabold after:mt-1.5 after:block after:h-1 after:w-12 after:rounded-sm after:bg-gold after:content-['']">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

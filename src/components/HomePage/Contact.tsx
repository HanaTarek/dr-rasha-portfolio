import Section from "./Section";

export default function Contact() {
  return (
    <Section id="contact" title="تواصل معي">
      <p className="mb-4">
        للتعاون العلمي أو المحاضرات أو الاستشارات في علم النفس الرياضي:
      </p>
      <p>
        <a
          href="mailto:rashaashraf23@gmail.com"
          className="inline-block rounded-xl border-2 border-btn bg-btn px-[26px] py-3 font-bold text-btn-ink no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          rashaashraf23@gmail.com
        </a>
      </p>
    </Section>
  );
}

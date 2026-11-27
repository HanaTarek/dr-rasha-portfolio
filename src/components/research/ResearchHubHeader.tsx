/* Shared by research/page.tsx and research/loading.tsx so the text can never drift apart. */
export default function ResearchHubHeader() {
  return (
    <header className="mx-auto mb-9 max-w-3xl text-center">
      <h1 className="mb-2.5 text-[clamp(24px,3.4vw,34px)] font-extrabold leading-normal text-ink after:mx-auto after:mt-1.5 after:block after:h-1 after:w-12 after:rounded-sm after:bg-gold after:content-['']">
        الرسائل العلمية
      </h1>
      <p className="leading-loose text-muted">
        رسائل الماجستير والدكتوراه التي أشرفتُ عليها أو شاركتُ في مناقشتها. اختر
        القسم الذي تريد تصفّحه.
      </p>
    </header>
  );
}

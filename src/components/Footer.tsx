export default function Footer({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <footer className="border-t border-line py-9 text-center text-muted">
      <div className="mx-auto max-w-[1000px] px-5">{text}</div>
    </footer>
  );
}

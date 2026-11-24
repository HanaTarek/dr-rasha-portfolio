export default function InfoList({ items }: { items: string[] }) {
  return (
    <ul className="grid list-none gap-2.5">
      {items.map((item) => (
        <li key={item} className="rounded-lg border border-line bg-bg px-4 py-3">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Словесный знак. Название бренда всегда латиницей и всегда в одном начертании. */
export default function Brand({ className = '' }: { className?: string }) {
  return <span className={`brand ${className}`.trim()}>PROJECT AMB</span>;
}

import { MEDIA, type MediaKey, type MediaSlot } from '@/lib/media';

type Props = {
  slot: MediaKey;
  className?: string;
  /** Первый экран грузим сразу, остальное — лениво. */
  priority?: boolean;
  /** Мягкое движение кадра при скролле. Только для крупных плоскостей. */
  parallax?: boolean;
  /** Медленный zoom при наведении. */
  zoom?: boolean;
  caption?: string;
  sizes?: string;
};

/**
 * Обёртка фотослота.
 *
 * Намеренно на обычном <img>, а не next/image: в слотах лежат уже
 * подготовленные webp фиксированных размеров, а полноэкранные плоскости
 * с параллаксом проще держать под собственным контролем.
 */
export default function Figure({
  slot,
  className = '',
  priority = false,
  parallax = false,
  zoom = false,
  caption,
  sizes = '100vw',
}: Props) {
  const media: MediaSlot = MEDIA[slot];

  return (
    <figure
      className={['figure', zoom ? 'figure--zoom' : '', parallax ? 'figure--parallax' : '', className]
        .filter(Boolean)
        .join(' ')}
      {...(parallax ? { 'data-parallax': '' } : {})}
    >
      <img
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        style={media.focus ? { objectPosition: media.focus } : undefined}
      />
      {caption ? <figcaption className="figure__caption">{caption}</figcaption> : null}
    </figure>
  );
}

import { jsonLd } from '@/lib/seo';

/** A `<script type="application/ld+json">` block. `jsonLd()` escapes `<`, so story text can't break out. */
export default function JsonLd({ data }: { data: unknown }) {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data must be raw JSON; jsonLd() escapes it.
  return <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(data)} />;
}

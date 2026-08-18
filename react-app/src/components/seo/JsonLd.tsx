/**
 * Emits a schema.org JSON-LD block for search engines and answer/generative
 * engines (Google, Bing, and AI answer engines that read structured data).
 *
 * The `<` escaping is the sanctioned Next.js pattern for JSON-LD: it is the one
 * character that could close the surrounding <script> early and inject markup,
 * so escaping it makes the serialized, server-controlled object safe to inline.
 * Nothing user-authored reaches here unescaped — callers pass plain data objects
 * built in src/lib/schema.ts.
 */
type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

export default function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

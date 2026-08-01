import { FC } from 'react';

interface JsonLdProps {
  /** One schema.org node, or several to emit as sibling scripts. */
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * The single emitter for every JSON-LD node on the site.
 *
 * The payload is passed as a **text child**, not via `dangerouslySetInnerHTML`.
 * That is deliberate and it is the safer of the two:
 *
 * - React treats `<script>` as a raw-text element, so the child is not
 *   HTML-escaped — an `&` in a value survives and the JSON still parses. (The
 *   commonly-repeated claim that React breaks JSON-LD this way is wrong; it was
 *   verified false against this repo's React 19.2.)
 * - React additionally neutralises a value containing `</script>`, emitting it
 *   as `</script>` — still valid JSON, and unable to close the element.
 *   `dangerouslySetInnerHTML` does no such thing and would let that value break
 *   out of the script.
 *
 * That second point is not theoretical here: `/tires/[slug]` renders database
 * strings (brand, model, description) into its Product node.
 *
 * The guarantee is pinned by `JsonLd.test.tsx`. Do not hand-write
 * `<script type="application/ld+json">` anywhere else — routing every node
 * through one component is what makes the guarantee verifiable once instead of
 * assumed nine times.
 */
const JsonLd: FC<JsonLdProps> = ({ data }) => {
  const nodes = Array.isArray(data) ? data : [data];

  return (
    <>
      {nodes.map((node, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(node)}
        </script>
      ))}
    </>
  );
};

export default JsonLd;

import { SingleTire } from '@/app/interfaces/tires';
import TreadWearExplorer from '@/app/ui/components/TreadWearExplorer/TreadWearExplorer';
import { ProductCarousel, TireInformation, TireFeatures, Benefits } from '@/app/ui/sections';

/**
 * Server Component: renders the whole product detail from server-fetched data,
 * so the content (and the LCP image) ships in the initial HTML — no client
 * `useEffect` fetch, no skeleton, no late layout shift. The genuinely interactive
 * parts (gallery/zoom, tread 3D, add-to-cart) are client islands fed by props.
 */
const DetailView = ({ product }: { product: SingleTire }) => {
  const nameParts = product.name?.split(' | ') ?? [];
  const productSize = nameParts.length >= 2 ? nameParts[nameParts.length - 1] : undefined;
  const breadcrumbLabel =
    `${product.condition} ${product.brand}${productSize ? ` ${productSize}` : ''}`.trim();
  const isNewTire = product.condition?.toLowerCase() === 'new';

  return (
    <>
      {/* ── Dark hero ── */}
      <div className="bg-[#0a0a0a] relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#9dfb40 1px,transparent 1px),linear-gradient(90deg,#9dfb40 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-5 pb-7 sm:pb-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center flex-wrap gap-x-1.5 gap-y-1 text-sm text-white/50">
              <li>
                <a href="/" className="hover:text-[#9dfb40] transition-colors duration-150">
                  Home
                </a>
              </li>
              <li aria-hidden="true" className="select-none">
                /
              </li>
              <li>
                <a href="/tires" className="hover:text-[#9dfb40] transition-colors duration-150">
                  Tires
                </a>
              </li>
              <li aria-hidden="true" className="select-none">
                /
              </li>
              <li>
                <span
                  aria-current="page"
                  className="text-white/80 font-medium truncate max-w-[220px] sm:max-w-none inline-block align-bottom"
                  title={breadcrumbLabel}
                >
                  {breadcrumbLabel}
                </span>
              </li>
            </ol>
          </nav>

          {/* Headline */}
          <div className="mt-5">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                  isNewTire
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-amber-100 text-amber-700 border border-amber-300'
                }`}
              >
                {isNewTire ? 'New' : 'Used'}
              </span>
              {productSize && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#9dfb40] text-[#0a0a0a] text-xs font-black tracking-wider">
                  {productSize}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              <span className="text-[#9dfb40]">{product.brand}</span>
              {product.model2 && <> {product.model2}</>}
            </h1>
          </div>
        </div>
        <div className="h-[3px] bg-gradient-to-r from-[#9dfb40] via-[#9dfb40]/40 to-transparent" />
      </div>

      {/* ── White product content ── */}
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-7 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
            <ProductCarousel singleTire={product} />
            <div className="mt-10 sm:mt-16 lg:mt-0">
              <TireInformation singleTire={product} />
              <section aria-labelledby="details-heading" className="my-6">
                <TireFeatures singleTire={product} />
              </section>
            </div>
          </div>
          <section aria-labelledby="tread-wear-heading" className="mt-10">
            <TreadWearExplorer singleTire={product} />
          </section>
        </div>
        <section className="mt-8 mb-8">
          <Benefits />
        </section>
      </div>
    </>
  );
};

export default DetailView;

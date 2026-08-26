import { FC } from 'react';

import { TireInformationProps } from '@/app/interfaces/tires';
import {
  ProductName,
  ProductPrice,
  ProductDescription,
  BrandImage,
  FreeShippingBadge,
} from '@/app/ui/components';
import AddToCartButton from '@/app/ui/components/AddToCartButton/AddToCartButton';
import { WhatsAppEnquiryButton } from '@/app/ui/components/WhatsAppEnquiryButton/WhatsAppEnquiryButton';
import { generateTireDescription } from '@/app/utils/tireDescription';
import { brandName, modelName, tireTitle } from '@/app/utils/tireNaming';
import { patchedNote, treadDepthLabel } from '@/app/utils/tireSpecs';

// Server Component: renders the product info from props. The only interactive
// piece (add-to-cart) is delegated to the `AddToCartButton` client island.
const TireInformation: FC<TireInformationProps> = ({ singleTire }) => {
  // Determine availability from DB Condition (exposed as status)
  const isSold =
    typeof singleTire.status === 'string' && singleTire.status.trim().toLowerCase() === 'sold';

  // Extract tire size from name format: "(CODE) | BRAND | SIZE"
  const nameParts = singleTire.name.split(' | ');
  const size = nameParts.length >= 2 ? nameParts[nameParts.length - 1] : undefined;

  // Extract technical specs from details items (e.g. "Load Index: 92")
  const detailItems: string[] = (singleTire.details?.[0]?.items as string[]) || [];
  const findDetail = (prefix: string) =>
    detailItems
      .find(i => i.startsWith(prefix))
      ?.split(': ')[1]
      ?.trim();

  const isNew = singleTire.condition?.toLowerCase() === 'new';
  const lifePct = parseInt((singleTire.remainingLife || '').replace('%', ''), 10) || 0;
  const lifeColor = lifePct >= 70 ? 'bg-[#9dfb40]' : lifePct >= 40 ? 'bg-amber-400' : 'bg-red-500';

  const tireDescription = generateTireDescription({
    brand: brandName(singleTire.brand),
    model: modelName(singleTire.model2),
    size,
    condition: singleTire.condition,
    remainingLife: singleTire.remainingLife,
    treadDepth: singleTire.treadDepth,
    patched: singleTire.patched,
    loadIndex: findDetail('Load Index'),
    speedIndex: findDetail('Speed Index'),
    city: singleTire.city,
  });

  return (
    <section aria-labelledby={`product-name-${singleTire.id}`}>
      <div role="group" aria-label="Product header">
        <div>
          <div className="mb-3">
            <div className="mb-4">
              <BrandImage
                product={{
                  brand: singleTire.brand,
                  brandId: singleTire.brandId,
                }}
              />
            </div>
            {/*
              The same name the card showed, so the tire does not change identity
              between the list and its own page. The stock code moves to the line
              below, where it is useful for support rather than sitting in the
              middle of the product name.
            */}
            <ProductName
              id={`product-name-${singleTire.id}`}
              type={2}
              size="3xl"
              weight="bold"
              name={tireTitle({ brand: singleTire.brand, model: singleTire.model2 })}
            />
            {singleTire.code && <p className="text-sm text-gray-500 mt-1">#{singleTire.code}</p>}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <h2 className="sr-only">Product information</h2>
            <div className="flex items-center gap-2">
              <ProductPrice price={singleTire.price} />
              <FreeShippingBadge />
            </div>
            {isSold ? (
              <div
                className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
                role="status"
                aria-live="polite"
              >
                Not available
              </div>
            ) : (
              <AddToCartButton product={singleTire} />
            )}
          </div>
          {/* Beneath the primary action, never beside it: Add to cart already
              renders as an outlined green button, so a second outlined button on
              the same row would read as an equal choice rather than a quieter
              one. Present on a sold tire too — that is the moment a customer is
              most likely to want to ask for another in the same size. */}
          <WhatsAppEnquiryButton product={singleTire} />
          <div
            aria-label="Key specifications"
            className={`mt-4 grid grid-cols-2 ${
              singleTire.runFlat ? 'sm:grid-cols-5' : 'sm:grid-cols-4'
            } divide-x divide-y sm:divide-y-0 divide-gray-100 border border-gray-200 rounded-xl overflow-hidden`}
          >
            <div className="px-3 py-3 bg-gray-50">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Condition
              </p>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${isNew ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
              >
                {isNew ? 'New' : 'Used'}
              </span>
            </div>
            <div className="px-3 py-3 bg-gray-50">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Life
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-gray-900">
                  {singleTire.remainingLife || '—'}
                </span>
                {lifePct > 0 && (
                  <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden max-w-[36px]">
                    <div
                      className={`h-full rounded-full ${lifeColor}`}
                      style={{ width: `${lifePct}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="px-3 py-3 bg-gray-50">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Tread
              </p>
              <span className="text-sm font-bold text-gray-900">
                {treadDepthLabel(singleTire.treadDepth)}
              </span>
            </div>
            <div className="px-3 py-3 bg-gray-50">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Patched
              </p>
              <span className="text-sm font-bold text-gray-900">{singleTire.patched || '—'}</span>
              {/*
                This is where a used-tire buyer hesitates. The fact stays; the
                context is what turns it from a warning into a reassurance.
              */}
              {patchedNote(singleTire.patched) && (
                <p className="mt-1 text-[11px] leading-snug text-gray-500">
                  {patchedNote(singleTire.patched)}
                </p>
              )}
            </div>
            {singleTire.runFlat && (
              <div className="col-span-2 sm:col-span-1 px-3 py-3 bg-gray-50">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  Run Flat
                </p>
                <span className="text-sm font-bold text-gray-900">
                  {/^y/i.test(singleTire.runFlat) ? 'Yes' : 'No'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="my-6">
        <ProductDescription description={tireDescription} />
      </div>
    </section>
  );
};

export default TireInformation;

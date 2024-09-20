import React from 'react';

function Card({ products }: { products: any }) {
  return (
    <div className="bg-white">
      <div className="mx-auto">
        <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product: any) => (
            <div key={product.id}>
              <div className="relative">
                <div className="relative h-72 w-full overflow-hidden rounded-lg">
                  <img
                    alt={product.imageAlt}
                    src={product.imageSrc}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="relative mt-4">
                  <div className="flex justify-between items-center">
                    <p className="mt-1 text-greenPrimary font-semibold text-2xl">
                      {product.price}
                    </p>
                    <button
                      type="button"
                      className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Details
                    </button>
                  </div>

                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <p className="mt-1 text-gray-900 text-sm">
                    <span>Patched: </span>
                    {product.patched}
                  </p>
                  <p className="mt-1 text-gray-900 text-sm">
                    <span>Remaining Life: </span>
                    {product.remainingLife}
                  </p>
                  <p className="mt-1 text-gray-900 text-sm">
                    <span>Tread Depth: </span>
                    {product.treadDepth}
                  </p>
                </div>
                <div className="absolute inset-x-0 top-0 flex h-72 items-end justify-end overflow-hidden rounded-lg p-4">
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black opacity-50"
                  />
                  <div className="absolute text-lg font-semibold text-white -top-2 -left-12  text-center -rotate-45">
                    {
                      <div
                        className={`pt-6 pb-3 px-12 text-sm ${
                          product.condition === 'new'
                            ? 'bg-greenPrimary'
                            : 'bg-gray-600'
                        }`}
                      >
                        {product.condition === 'new' ? 'New' : 'Used'}
                      </div>
                    }
                  </div>
                  <div className="absolute text-lg font-semibold text-white right-1.5 bottom-1.5">
                    {product.brand === 'goodYear' && (
                      <img
                        className="w-32"
                        src="images/goodyear-logo.png"
                        alt={product.brand}
                      />
                    )}
                    {product.brand === 'michelin' && (
                      <img
                        className="w-32"
                        src="images/michelin-logo.png"
                        alt={product.brand}
                      />
                    )}
                    {product.brand === 'hankook' && (
                      <img
                        className="w-32"
                        src="images/hankool-logo.jpg"
                        alt={product.brand}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <a
                  href={product.href}
                  className="relative flex items-center justify-center rounded-md border border-transparent bg-gray-100 px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                >
                  Add to bag<span className="sr-only">, {product.name}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Card;
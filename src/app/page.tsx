'use client';
//mis importaciones
import TopFilter from '@/app/components/topFilter/TopFilter';
import TireCard from '@/app/components/card/Card';
import Title from '@/app/components/title/Title';
import MobileTopFilters from '@/app/components/mobileTopFilters/MobileTopFilters';
import LateralFilters from '@/app/components/lateralFilters/LateralFilters';
import MobileLateralFilters from '@/app/components/mobileLateralFilters/MobileLateralFilters';
import { useContext } from 'react';
import { FiltersContext } from '@/app/context/FiltersContext';

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  ChevronDownIcon,
  FunnelIcon,
  MinusIcon,
  PlusIcon,
  Squares2X2Icon,
} from '@heroicons/react/20/solid';



//fin mis importaciones

import {
  useCallback,
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
  lazy,
  Suspense,
} from 'react';
import type { DocumentRecord } from '@/app/api/tires/route';
import { TiresData } from '@/app/interfaces/tires';
import Card from '@/app/components/Card';
import { useGenerateFixedPagination } from '@/app/hooks/useGeneratePagination';

export default function Home() {
  const [records, setRecords] = useState<DocumentRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const totalRecords = 100; // Asumimos que tienes este valor disponible
  const totalPages = Math.ceil(totalRecords / pageSize);
  const maxVisiblePages = 5;

  // const getTires = useCallback(
  //   async (page: number) => {
  //     setLoading(true);
  //     try {
  //       const response = await fetch(
  //         `/api/tires?page=${page}&pageSize=${pageSize}`
  //       );
  //       const data = await response.json();
  //       setRecords(data);
  //     } catch (error: any) {
  //       setError(error.message);
  //     } finally {
  //       setLoading(false); // Desactivar el loading después de la solicitud
  //     }
  //   },
  //   [pageSize]
  // );

  // useEffect(() => {
  //   getTires(page);
  // }, [getTires, page]);

  // const handleNextPage = () => {
  //   setPage((prevPage) => prevPage + 1);
  // };

  // const handlePreviousPage = () => {
  //   if (page > 1) {
  //     setPage((prevPage) => prevPage - 1);
  //   }
  // };

  // const handlePageSizeChange = (
  //   event: React.ChangeEvent<HTMLSelectElement>
  // ) => {
  //   const newPageSize = parseInt(event.target.value, 10);

  //   // Calcular la nueva página basada en la posición actual
  //   const currentRecordIndex = (page - 1) * pageSize; // Índice del primer registro en la página actual
  //   const newPage = Math.floor(currentRecordIndex / newPageSize) + 1;

  //   setPageSize(newPageSize);
  //   setPage(newPage); // Establecer la nueva página calculada
  // };

  // const handlePageClick = (pageNumber: number) => {
  //   setPage(pageNumber);
  // };

  // const handleFirstPage = () => {
  //   setPage(1);
  // };

  // const handleLastPage = () => {
  //   setPage(totalPages);
  // };

  // const pagination = useGenerateFixedPagination(
  //   page,
  //   totalPages,
  //   maxVisiblePages
  // );

  // const availablePageSizes = [10, 20, 50].filter(
  //   (size) => size <= totalRecords
  // );

  // return (
  //   <main className="flex min-h-screen flex-col items-center xl:p-24 lg:p-24 md:p-2 sm:p-2">
  //     <h1 className="text-4xl">Tires</h1>
  //     {error ? (
  //       <div className="text-red-500">Error: {error}</div>
  //     ) : (
  //       <div className="mt-6 overflow-auto w-full">
  //         <h3 className="text-2xl mb-3">Tires Register:</h3>
  //         <div className="relative">
  //           <ul className="text-white flex flex-wrap">
  //             {records.map((record: TiresData) => (
  //               <li key={record.TireId} className="list-none">
  //                 <Card {...record} />
  //               </li>
  //             ))}
  //           </ul>
  //           {loading && (
  //             <div className="absolute inset-0 flex items-center justify-center bg-black">
  //               <div className="loader">Loading...</div>
  //             </div>
  //           )}
  //         </div>
  //         <div className="mt-4 flex justify-center gap-1">
  //           <div className="flex gap-1">
  //             <button
  //               onClick={handleFirstPage}
  //               disabled={page === 1} // Deshabilitar si ya estás en la primera página
  //               className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
  //             >
  //               &lt;&lt;
  //             </button>
  //             <button
  //               onClick={handlePreviousPage}
  //               disabled={page === 1} // Deshabilitar el botón si estás en la primera página
  //               className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
  //             >
  //               &lt;
  //             </button>
  //           </div>
  //           {pagination.map((pageNumber, index) =>
  //             typeof pageNumber === 'number' ? (
  //               <button
  //                 key={index}
  //                 onClick={() => handlePageClick(pageNumber)}
  //                 className={`px-3 py-1 mx-1 rounded ${
  //                   pageNumber === page
  //                     ? 'bg-blue-600 text-white'
  //                     : 'bg-gray-700 text-white hover:bg-gray-600'
  //                 }`}
  //               >
  //                 {pageNumber}
  //               </button>
  //             ) : (
  //               <span key={index} className="px-3 py-1 mx-1 text-gray-500">
  //                 {pageNumber}
  //               </span>
  //             )
  //           )}
  //           <div className="flex gap-1">
  //             <button
  //               onClick={handleNextPage}
  //               className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
  //               disabled={page === totalPages} // Deshabilitar si ya estás en la última página
  //             >
  //               &gt;
  //             </button>
  //             <button
  //               onClick={handleLastPage}
  //               disabled={page === totalPages} // Deshabilitarsiyaestásenlaúltimapágina"
  //               className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
  //             >
  //               &gt;&gt;
  //             </button>
  //           </div>
  //         </div>
  //         {totalRecords >= 10 && (
  //           <div className="mt-4">
  //             <label htmlFor="pageSize" className="mr-2">
  //               Page Size:
  //             </label>
  //             <select
  //               id="pageSize"
  //               value={pageSize}
  //               onChange={handlePageSizeChange}
  //               className="px-4 py-2 bg-gray-700 rounded"
  //             >
  //               {availablePageSizes.map((size) => (
  //                 <option key={size} value={size}>
  //                   {size}
  //                 </option>
  //               ))}
  //             </select>
  //           </div>
  //         )}
  //       </div>
  //     )}
  //   </main>
  // )

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const sortOptions = [
    { name: 'Most Popular', href: '#', current: true },
    { name: 'Best Rating', href: '#', current: false },
    { name: 'Newest', href: '#', current: false },
    { name: 'Price: Low to High', href: '#', current: false },
    { name: 'Price: High to Low', href: '#', current: false },
  ];

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  //cards
  const products = [
    {
      id: 1,
      name: 'G012',
      color: 'White and black',
      href: '#',
      imageSrc: 'images/llanta1.png',
      imageAlt:
        'Front of zip tote bag with white canvas, black canvas straps and handle, and black zipper pulls.',
      price: '$140',
      brand: 'goodYear',
      condition: 'new',
      patched: 'Yes',
      remainingLife: '90%',
      treadDepth: '10.0/32',
    },
    {
      id: 2,
      name: 'G003 LT',
      color: 'White and black',
      href: '#',
      imageSrc: 'images/llanta3.jpg',
      imageAlt:
        'Front of zip tote bag with white canvas, black canvas straps and handle, and black zipper pulls.',
      price: '$220',
      brand: 'michelin',
      condition: 'used',
      patched: 'No',
      remainingLife: '90%',
      treadDepth: '10.0/32',
    },
    {
      id: 3,
      name: 'G003 LT',
      color: 'White and black',
      href: '#',
      imageSrc: 'images/llanta4.jpg',
      imageAlt:
        'Front of zip tote bag with white canvas, black canvas straps and handle, and black zipper pulls.',
      price: '$220',
      brand: 'hankook',
      condition: 'new',
      patched: 'No',
      remainingLife: '90%',
      treadDepth: '10.0/32',
    },
    {
      id: 4,
      name: 'G012',
      color: 'White and black',
      href: '#',
      imageSrc: 'images/llanta1.png',
      imageAlt:
        'Front of zip tote bag with white canvas, black canvas straps and handle, and black zipper pulls.',
      price: '$140',
      brand: 'goodYear',
      condition: 'new',
      patched: 'Yes',
      remainingLife: '90%',
      treadDepth: '10.0/32',
    },
    {
      id: 1,
      name: 'G012',
      color: 'White and black',
      href: '#',
      imageSrc: 'images/llanta1.png',
      imageAlt:
        'Front of zip tote bag with white canvas, black canvas straps and handle, and black zipper pulls.',
      price: '$140',
      brand: 'goodYear',
      condition: 'new',
      patched: 'Yes',
      remainingLife: '90%',
      treadDepth: '10.0/32',
    },
    {
      id: 2,
      name: 'G003 LT',
      color: 'White and black',
      href: '#',
      imageSrc: 'images/llanta3.jpg',
      imageAlt:
        'Front of zip tote bag with white canvas, black canvas straps and handle, and black zipper pulls.',
      price: '$220',
      brand: 'michelin',
      condition: 'used',
      patched: 'No',
      remainingLife: '90%',
      treadDepth: '10.0/32',
    },
    {
      id: 3,
      name: 'G003 LT',
      color: 'White and black',
      href: '#',
      imageSrc: 'images/llanta4.jpg',
      imageAlt:
        'Front of zip tote bag with white canvas, black canvas straps and handle, and black zipper pulls.',
      price: '$220',
      brand: 'hankook',
      condition: 'new',
      patched: 'No',
      remainingLife: '90%',
      treadDepth: '10.0/32',
    },
    {
      id: 4,
      name: 'G012',
      color: 'White and black',
      href: '#',
      imageSrc: 'images/llanta1.png',
      imageAlt:
        'Front of zip tote bag with white canvas, black canvas straps and handle, and black zipper pulls.',
      price: '$140',
      brand: 'goodYear',
      condition: 'new',
      patched: 'Yes',
      remainingLife: '90%',
      treadDepth: '10.0/32',
    },
  ];

  const lateralMenuRef = useRef<HTMLDivElement>(null);

  const [lateralmenuWidth, setLateralMenuWidth] = useState<number>(0);
  const {topMargin} = useContext(FiltersContext)


  //tamaño del menu lateral cuandos e hace resize o cuando carga el componente
  useLayoutEffect(() => {

    const lateralMenu = lateralMenuRef !== null && lateralMenuRef.current;
  
    const getLateralMenuWidth = () => {
      if(lateralMenu){
          const lateralMenuCurrentWidth = lateralMenu?.getBoundingClientRect().width;
          lateralMenuCurrentWidth !== undefined && setLateralMenuWidth(lateralMenuCurrentWidth);
      }
    };

    getLateralMenuWidth();

    const lateralMenuWidth = () => {
      getLateralMenuWidth();
    };
    window.addEventListener('resize', lateralMenuWidth);

    return () => window.removeEventListener('resize', lateralMenuWidth);
  }, []);

  return (
    <div className="bg-white">
      <div>
        {/*Lateral Mobile filter dialog */}
        <MobileLateralFilters x={mobileFiltersOpen} y={setMobileFiltersOpen} />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="sm:mb-16 mt-16">
            <Title />
          </div>
          <section aria-labelledby="products-heading" className="pb-24">
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4 ">
              {/*lateral Filters desk*/}
              <div
                ref={lateralMenuRef}
                className="hidden lg:block"
              >
                {/* <div className='border-4 border-slate-950 fixed top-24 overflow-auto h-full]'> */}
                <div
                  style={{ width: `${lateralmenuWidth}px`, top: `${topMargin}px`}}
                  className="fixed overflow-auto h-screen"
                >
                    <LateralFilters />
                </div>
              </div>

              {/* Product grid */}
              <div className="lg:col-span-3">
                {/* top filters for desktop */}
                <div className="hidden sm:block sticky top-0 z-40 bg-white pb-4">
                  <TopFilter />
                </div>
                {/*top filters for mobile  */}
                <div className="sticky block sm:hidden top-0 z-40  pt-4 pb-4 bg-white">
                  <MobileTopFilters>
                    <div className="p-4">
                      <TopFilter />
                    </div>
                  </MobileTopFilters>
                </div>

                <h2 className="font-medium text-base  sm:mt-14">
                  Results for Tires: 255/55 R18
                </h2>
                <div className="flex items-center justify-between mt-8">
                  <h3 className="text-gray-400">91 Results</h3>
                  <div className="flex items-baseline justify-end">
                    <div className="flex items-center">
                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
                        <div>
                          <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                            Sort
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                            />
                          </MenuButton>
                        </div>

                        <MenuItems
                          transition
                          className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                        >
                          <div className="py-1">
                            {sortOptions.map((option) => (
                              <MenuItem key={option.name}>
                                <a
                                  href={option.href}
                                  className={classNames(
                                    option.current
                                      ? 'font-medium text-gray-900'
                                      : 'text-gray-500',
                                    'block px-4 py-2 text-sm data-[focus]:bg-gray-100'
                                  )}
                                >
                                  {option.name}
                                </a>
                              </MenuItem>
                            ))}
                          </div>
                        </MenuItems>
                      </Menu>

                      <button
                        type="button"
                        className="-m-2 ml-5 p-2 text-gray-400 hover:text-gray-500 sm:ml-7"
                      >
                        <span className="sr-only">View grid</span>
                        <Squares2X2Icon
                          aria-hidden="true"
                          className="h-5 w-5"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => setMobileFiltersOpen(true)}
                        className="-m-2 ml-4 p-2 text-greenPrimary sm:ml-6 lg:hidden"
                      >
                        <span className="sr-only">Filters</span>
                        <FunnelIcon aria-hidden="true" className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-12">
                  <TireCard products={products} />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

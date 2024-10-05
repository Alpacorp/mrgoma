'use client';

import React, { useEffect, useState, useContext, useRef, useLayoutEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';

import { ShowDetailModalContext } from '@/app/context/ShowDetailModal';
import { TireInformationProps } from '@/app/interfaces/tires';
import { CtaButton } from '@/app/ui/components';



function ModalDetail({ singleTire }: TireInformationProps) {

 const {showDetailModal, setShowDetailModal } = useContext(ShowDetailModalContext);
 const [open, setOpen] = useState(false);

 useEffect(()=> {
    setOpen(showDetailModal)
    return ()=> {
        if(showDetailModal){
            setShowDetailModal(false)
        }
    }
 },[showDetailModal])


 const backdropRef = useRef(null)
 const backdrop = backdropRef.current
 //cuando sse hace click en el backdropp
 if(backdrop){
    setShowDetailModal(false)
 }

 
  return (
    <Dialog open={open} onClose={setOpen} className="relative z-40">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto"  ref={backdropRef}  >
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 w-full sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div>
              <div className="text-center">
                <DialogTitle
                  as="h3"
                  className="text-base font-semibold leading-6 text-gray-900 mb-6"
                >
                  Tire Features
                </DialogTitle>
                <div className="mt-2 pl-2">
                  <ul className="text-left text-sm text-gray-500 list-disc">
                    {singleTire?.details[0]?.items.map((item: any) => {
                      return (
                        <li key={item} className="mb-1.5 flex">
                          <CheckCircleIcon
                            aria-hidden="true"
                            className="h-5 w-5 flex-shrink-0 text-green-primary font-semibold mr-3"
                          />
                          {item}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className=" inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1  mb-3 sm:mb-0"
              >
                Close
              </button>
              <CtaButton product={singleTire} text='View Tire'/>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

export default ModalDetail;

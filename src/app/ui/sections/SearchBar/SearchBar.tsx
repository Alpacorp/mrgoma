import React from 'react'
import { SearchButton } from '@/app/ui/components'

function SearchBar() {
  return (
    <div className="space-y-4 flex">
            <input
              autoComplete='off'
              id="email"
              name="email"
              type="text"
              className="block w-full rounded-md border-0 rounded-r-none py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-primary sm:text-sm sm:leading-6 mt-4"
            />
           <SearchButton/>
          </div>
  )
}

export default SearchBar
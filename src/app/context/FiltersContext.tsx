"use client"
import React, {useState, createContext} from 'react';


type FiltersMarginType = {
    topMargin: number,
    setTopMargin: (value: number) => void
}

const FiltersContext = createContext<FiltersMarginType>({topMargin:0, setTopMargin: ()=>{}});

const FiltersProvider = ({children}:{children: React.ReactNode}) => {

    const [topMargin, setTopMargin] = useState<number>(0)

    return (
        <FiltersContext.Provider value={{topMargin,  setTopMargin}}>
            {children}
        </FiltersContext.Provider>
    )
}


export {FiltersContext, FiltersProvider}
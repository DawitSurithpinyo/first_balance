import { RecordItem } from '@/interface';
import React, { createContext, useCallback, useContext, useState } from 'react';
import getRecords from './getRecords';

const RecordContext = createContext<any>(null);

// Allow pages to access records itself, and fetchRecords()
export function useRecordContext(){
    const context = useContext(RecordContext)
    if(!context) {
      throw new Error('useRecordContext must be used inside RecordContext Provider')
    }
    return context
  }


// For wrapping the entire webapp, to share records and fetchRecords() globally
// And allow pages to use useRecordContext()
export default function RecordProvider({children}: {children:React.ReactNode}) {
    const [records, setRecords] = useState<RecordItem[]>([]);

    // "Memoized" getRecords, the function to fetch records from backend 
    // meaning that it remembers what function to run (getRecords)
    // so it doesn't have to recreate the function every time it renders
    const fetchRecords = useCallback(() => {
        getRecords({setRecordsData: setRecords});
    }, []);

    return (
        <RecordContext.Provider value={{records, setRecords, fetchRecords}}>
          {children}
        </RecordContext.Provider>
    );
}
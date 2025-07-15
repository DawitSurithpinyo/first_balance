import { userCredentials } from "@/interface";
import React, { createContext, useContext, useState } from "react";

const credentialContext = createContext<any>(null)

export function useCredentialContext() {
    const context = useContext(credentialContext)
    if(!context) {
      throw new Error('useCredentialContext must be used inside credentialContext Provider')
    }
    return context
}

export default function CredentialProvider({children}: {children:React.ReactNode}) {
    const [credentials, setCredentials] = useState<userCredentials>({UserName:'', UserEmail:''})
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    const login = (cred:userCredentials) => {
        setCredentials(cred)
        setIsAuthenticated(true)
    }

    const logout = () => {
        setCredentials({UserName:'', UserEmail:''})
        setIsAuthenticated(false)
    }

    return(
        <credentialContext.Provider value={{credentials, isAuthenticated, login, logout}}>
            {children}
        </credentialContext.Provider>
    )
}
import { useCredentialContext } from "@/lib/credentialsContext";
import { Redirect } from "expo-router";

export function ProtectedRoute({children}: {children:React.ReactNode}) {
    const { isAuthenticated:isAuthenticated } = useCredentialContext()

    if(!isAuthenticated){
        // If user try to access main pages without logging in,
        // force redirect back to login page
        return(<Redirect href="/"/>)
    }

    return <>{children}</>
}
import { useCredentialContext } from "@/frontend/lib/credentialsContext";
import { Redirect } from "expo-router";

export function ProtectedRoute({children}: {children:React.ReactNode}) {
    const { isAuthenticated:isAuthenticated } = useCredentialContext()

    if(!isAuthenticated){
        // If user try to access main pages without logging in,
        // force redirect back to login page
        return(<Redirect href="/"/>)
        // Actually, I don't need to make additional logic to allow accessing signIn and signUp pages without logging in!!
        // I wrapped ProtectedRoute component around all the tabs in @/(tabs)/_layout.tsx,
        // but signIn and signUp aren't one of those tabs, so this restriction logic doesn't apply to them, thus accessing them while still unauthenticated is possible!!!
    }

    return <>{children}</>
}
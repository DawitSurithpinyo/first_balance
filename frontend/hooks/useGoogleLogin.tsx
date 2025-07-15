import clientGoogleLogin from "@/frontend/lib/clientGoogleLogin";
import { userCredentials } from "@/interface";
import { useGoogleLogin } from "@react-oauth/google";
// How to set up in API console to use Google OAuth 2.0: https://support.google.com/googleapi/answer/6158849?hl=en&authuser=2#zippy=%2Cpublic-and-internal-applications%2Cweb-applications
// https://www.npmjs.com/package/@react-oauth/google

export function useGoogleLoginHook(onSuccessCallback?: (cred:userCredentials) => void) {
    // if not succeed, return void
    return useGoogleLogin({
        flow: 'auth-code',
        onSuccess: async (codeResponse) => {
            try {
                // async operation needs await inside, don't forget
                const cred = await clientGoogleLogin({
                    code: codeResponse.code,
                    state: codeResponse.state,
                    scope: codeResponse.scope
                })
                if (onSuccessCallback) {
                    onSuccessCallback(cred) // Pass credentials back
                }
            }
            catch(error){
                console.log('Login failed: ', error)
            }
            
        },
        onError: errorResponse => {
            console.log("Auth error: ", errorResponse)
        }
    });
}
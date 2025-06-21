import { CodeResponse } from "@react-oauth/google";
import { Platform } from "react-native";

export default function clientGoogleLogin(
    {code, state, scope}:{code:CodeResponse['code'], state:CodeResponse['state'], scope:CodeResponse['scope']}
)   {
        const login = async() => {
            try {
                const ip = "192.168.1.139"
                var link = "";
                if(Platform.OS === 'web'){
                    link = "http://localhost:5000"
                }
                else if(Platform.OS === 'android'){
                    link = `http://${ip}:5000`
                }

                const response = await fetch(`${link}/auth/google_login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        code: code,
                        state: state
                    }),
                    credentials: 'include'
                })

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server error: ${response.status} - ${errorText}`);
                }

                return await response.json();
            }

            catch(error) {
                console.log('Google login failed: ', error)
                throw(error)
            }
            
        }

        return login();
}
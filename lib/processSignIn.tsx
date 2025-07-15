import { router } from "expo-router";
import { Platform } from "react-native";

export default function processSignIn({userEmail, userPassword, setSignInResponse, login}: {userEmail:string, userPassword:string, setSignInResponse:Function, login:Function}) {
    // const {login:login} = useCredentialContext()
    // ^ We can't use it here. It'll cause React invalid hook call error
    // pass it as a function from the signIn.tsx instead
    const signInFunc = async() => {
        try {
            // if npm run android, will need to run with your computer's local IP,
            // which you can get by: when running npm run android, there will be a link like this:
            // exp://<your local IP>:<port number>
            // put <your local IP> here
            const ip = "192.168.212.237"
            var link = "";
            if(Platform.OS === 'web'){
                link = "http://localhost:5000"
            }
            else if(Platform.OS === 'android'){
                link = `http://${ip}:5000`
            }

            const response = await fetch(`${link}/auth/signIn`, {
                    'method': 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        Email: userEmail,
                        Password: userPassword
                    })
                }
            )

            const json = await response.json()
            if(!response.ok){
                const errorMsg = json['error']
                setSignInResponse(errorMsg)
                return
            }

            login(json)
            router.replace('/(tabs)/dashboard')
        }

        catch (error){
            console.log("Error signing in: ", error)
        }
    }

    signInFunc()
}
import { Platform } from "react-native";

export default function processLogout() {
    const logoutFunc = async() => {
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

            const response = await fetch(`${link}/api/auth/logout`, {
                    'method': 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'X-CSRF-Token': 
                    },
                    credentials: 'include'
                }
            )

            if(!response.ok){
                console.log(JSON.stringify(response))
            }
        }

        catch (error){
            console.log("Error logging out: ", error)
        }
    }

    logoutFunc()
}
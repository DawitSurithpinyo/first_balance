import { Platform } from "react-native";

export default function fetchCredentials(){
    const fetchFunc = async() => {
        try {
            const ip = "192.168.212.237"
            var link = "";
            if(Platform.OS === 'web'){
                link = "http://localhost:5000"
            }
            else if(Platform.OS === 'android'){
                link = `http://${ip}:5000`
            }

            const response = await fetch(`${link}/api/auth/getCredentials`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                    // 'X-CSRF-Token'
                },
                credentials: 'include'
            })

            if(!response.ok){
                console.log(JSON.stringify(response))
            }
        }

        catch (error){
            console.log("Error logging out: ", error)
        }
    }

    fetchFunc()
}
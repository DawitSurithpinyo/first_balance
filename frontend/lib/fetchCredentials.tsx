import { userCredentials, type failureResponse, type successResponse } from "@/interface";
import { Platform } from "react-native";

export default async function fetchCredentials(): 
    Promise<successResponse<userCredentials> | failureResponse>
{
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
            },
            credentials: 'include'
        }) as any

        if(!response.ok){
            return {
                success: false,
                error: response['error'],
                timestamp: response['timestamp']
            } as failureResponse
        }

        // const resp: successResponse = {
        //     success: true,
        //     message: response['']
        // }

        // const {setCredentials, setIsAuthenticated} = useCredentialContext();
        // setCredentials()
        // setIsAuthenticated(true);
        return {
            success: true,
            message: response['message'],
            data: response['data'] as userCredentials ?? null,
            timestamp: response['timestamp']
        } as successResponse
    }

    catch (error){
        console.log("Error logging out: ", error)
    }
}
import { useCredentialContext } from "@/lib/credentialsContext";
import processLogout from "@/lib/processLogout";
import { Text, TouchableOpacity, View } from "react-native";

export default function userInfo() {
    const {credentials:credentials, isAuthenticated:isAuthenticated, login:login, logout:logout} = useCredentialContext()
    const logoutFunc = async() => {
        // logout(), as defined in credentialsContext.tsx, set isAuthenticated to false,
        // which will automatically redirect user to login page, by design of ProtectedRoute component
        await logout()
        processLogout()
    }

    return(
        <View>
            <Text style={{'color':'white'}}>Email: {credentials.UserEmail}</Text>
            <Text style={{'color':'white'}}>Username: {credentials.UserName}</Text>
            <TouchableOpacity style={{"alignSelf":'center', 'backgroundColor':'gray'}}
                onPress={() => logoutFunc()}
            >
                <Text>Logout</Text>
            </TouchableOpacity>
        </View>
    )
}
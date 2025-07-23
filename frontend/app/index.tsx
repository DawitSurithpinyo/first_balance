import { userCredentials } from "@/interface";
import { useCredentialContext } from "@/lib/credentialsContext";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useGoogleLoginHook } from "../hooks/useGoogleLogin";

export default function Login() {
    const {credentials:credentials, login:login} = useCredentialContext()

    // Callback to handle successful login
    const handleGoogleLoginSuccess = (cred:userCredentials) => {
        login(cred);
        // unlike router.navigate(), router.replace() will not actually refresh browser upon going to the link
        // which we need to preserve the user credentials context
        router.replace("/(tabs)/dashboard")
    };
    const googleLogin = useGoogleLoginHook(handleGoogleLoginSuccess);


    function handleSignIn() {
        router.replace("/signIn")
    }

    function handleSignUp() {
        router.replace("/signUp")
    }
    return(
        <View>
            <Text style={{color:"white"}}>
                Log in to use First balance via either Google (recommended) or sign in/sign up below.
            </Text>
            <TouchableOpacity style={{"alignSelf":'center', 'backgroundColor':'gray'}} onPress={() => googleLogin()}>
                <Text>Login with Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{"alignSelf":'center', 'backgroundColor':'gray'}} onPress={() => {handleSignIn()}}>
                <Text>Sign in</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{"alignSelf":'center', 'backgroundColor':'gray'}} onPress={() => {handleSignUp()}}>
                <Text>Sign up</Text>
            </TouchableOpacity>
        </View>
    )
}
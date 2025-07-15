import { useCredentialContext } from "@/frontend/lib/credentialsContext";
import processSignUp from "@/frontend/lib/processSignup";
import { router } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-paper";

export default function SignUp() {
    var zxcvbn = require('zxcvbn');
    const {login:login} = useCredentialContext()
    const [inputEmail, setInputEmail] = useState("")
    const [inputName, setInputName] = useState("")
    const [inputPW, setInputPW] = useState("")
    const [invalidMsg, setInvalidMsg] = useState("")
    const [signUpResponse, setSignUpResponse] = useState<string|undefined>(undefined)

    const handleSignUp = async() => {
        let localInvalidMsg = ''
        let isValid = true
        if(!inputEmail || inputEmail.trim() === ''){
            localInvalidMsg = "Please enter an email"
            isValid = false
        }
        if(!inputName || inputName.trim() === ''){
            localInvalidMsg = "Username must be at least 1 character long"
            isValid = false
        }
        // basic email validation
        // https://stackoverflow.com/a/39425165
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if(!re.test(inputEmail)){
            localInvalidMsg = "Please enter a valid email"
            isValid = false
        }
        // https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#implement-proper-password-strength-controls
        if(!inputPW || inputPW.length < 8 || inputPW.length > 64){
            localInvalidMsg = "Password must be at least 8 characters and at most 64 characters"
            isValid = false
        }
        
        setInvalidMsg(localInvalidMsg)
        if(!isValid){
            return
        }

        processSignUp({
            userEmail: inputEmail,
            userName: inputName,
            userPassword: inputPW,
            setSignUpResponse: setSignUpResponse,
            login: login
        })
    }

    return(
        <View>
            <TouchableOpacity style={{"alignSelf":'center', 'backgroundColor':'gray'}} onPress={() => router.replace('/')}>
                <Text>{'<'} Go back to login</Text>
            </TouchableOpacity>
            <Text style={{'fontSize':40, 'color':'white', 'alignSelf':'center'}}>Welcome back</Text>
            <Text style={{'fontSize':30, 'color':'white', 'alignSelf':'center'}}>Enter your email and password</Text>
            <Text style={{'fontSize':14, 'color':'white'}}>Email</Text>
            <TextInput
                keyboardType="email-address"
                onChangeText={(email) => setInputEmail(email)}
            ></TextInput>
            <Text style={{'fontSize':14, 'color':'white'}}>Username (at least 1 character)</Text>
            <TextInput
                onChangeText={(username) => setInputName(username)}
            ></TextInput>
            <Text style={{'fontSize':14, 'color':'white'}}>Password</Text>
            <TextInput
                onChangeText={(pw) => setInputPW(pw)}
            ></TextInput>

            <TouchableOpacity style={{"alignSelf":'center', 'backgroundColor':'gray'}} onPress={handleSignUp}>
                <Text>Sign up</Text>
            </TouchableOpacity>
            <Text style={{'fontSize':14, 'color':'white'}}>{invalidMsg}</Text>
            <Text style={{'fontSize':14, 'color':'white'}}>{signUpResponse}</Text>
        </View>
    )
}
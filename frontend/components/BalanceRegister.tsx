import { RecordItem, RecordResponseJson } from "@/interface"
import addRecord from "@/lib/addRecord"
import { Picker } from "@react-native-picker/picker"
import { format } from "date-fns"
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from "react"
import { Appearance, Button, TextInput, useWindowDimensions } from "react-native"
import { DatePickerModal, enGB, registerTranslation } from "react-native-paper-dates"
import BalanceRegisterStyle from "./BalanceRegisterStyle"
import { ThemedText } from "./ThemedText"
import { ThemedView } from "./ThemedView"

import { useRecordContext } from "@/lib/recordContext"

export default function BalanceRegister()
{
    registerTranslation("en", enGB);
    const {records: listOfRecords, setRecords: setListOfRecords, fetchRecords} = useRecordContext();
    const SM_SCREEN = 576
    const {height, width} = useWindowDimensions()
    //recieve or pay is a pick value that help user deduct whether they're paying or earning money
    const [receiveOrPay, setReceiveOrPay] = useState('pay')
    const [transactionName, setTransactionName] = useState('')
    const [accountID, setAccountID] = useState('')
    const [value, setValue] = useState('')
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [registerDate, setRegisterDate] = useState<Date|undefined>(undefined)
    const [memo, setMemo] = useState('')
    const [invalidMsg, setInvalidMsg] = useState('')
    // const [val, setVal] = useState(Number())
    const [registerResponse, setRegisterResponse] = useState<RecordResponseJson|undefined>(undefined)
    const colorScheme = Appearance.getColorScheme();

    // use useFocusEffect on individual pages instead of in recordContext.tsx
    useFocusEffect(
    useCallback(() => {
        fetchRecords();
    }, [fetchRecords])
    );


    const handleRegistry = async () => {
        let isValid = true;
        const today = new Date()
        today.setHours(23,59,59,0)
        // setInvalidMsg('');
        let localInvalidMsg = ''

        if(accountID.trim()===''){
            // setInvalidMsg('please enter the account ID')
            localInvalidMsg = 'please enter the account ID'
            isValid = false
        }
        else if(transactionName.trim()===''){
            // setInvalidMsg('please enter the transaction name')
            localInvalidMsg = 'please enter the transaction name'
            isValid = false
        }
        else if(value.trim()===''){
            // setInvalidMsg('please enter the transaction value')
            localInvalidMsg = 'please enter the transaction value'
            isValid = false
        }
        else if(isNaN(Number(value.trim()))){
            // setInvalidMsg('please enter numeric amount of transaction value')
            localInvalidMsg = 'please enter numeric amount of transaction value'
            isValid = false
        }
        else if(Number(value.trim())<=0){
            // setInvalidMsg('please enter positive amount of transaction value')
            localInvalidMsg = 'please enter positive amount of transaction value'
            isValid = false
        }
        else if(!registerDate || registerDate==undefined){
            // setInvalidMsg('Please select register date')
            localInvalidMsg = 'Please select register date'
            isValid = false
        }
        else if(registerDate>=today){
            // setInvalidMsg('you can only register transaction happened today or the day before that')
            localInvalidMsg = 'you can only register transaction happened today or the day before that'
            isValid = false
        }
        // else{
        //     // setInvalidMsg('')
        //     localInvalidMsg = ''
        // }

        // Update state ONCE with final message
        setInvalidMsg(localInvalidMsg);

        // prevent submit button being clickable when invalidMsg !== ''
        if (!isValid){
            return;
        }

        
        const numericValue = receiveOrPay === 'pay' 
            ? -Number(value) // if pay, number is negative (lose money)
            : Number(value)

        const Recorditem:RecordItem = {
            TransactionName: transactionName,
            AccountID: accountID,
            Value: numericValue,
            Date: (registerDate!=undefined)? format(registerDate,'dd-MM-yyyy'):'',
            Memo: memo
        }

        await addRecord({recItem:Recorditem, setResponse:setRegisterResponse})
        await fetchRecords()

        //Reset booking form
        setTransactionName('')
        setReceiveOrPay('pay')
        setAccountID('')
        setValue('')
        setRegisterDate(undefined)
        setMemo('')
    }

    const onDatePickerConfirm = (params: {date:Date|undefined}) =>{
        setShowDatePicker(false)
        setRegisterDate(params.date)
    }
    return(
        <ThemedView style={{width : (width>SM_SCREEN)?"50%":"auto"}}>
            <ThemedText style={BalanceRegisterStyle.label}>Are you earning or paying?</ThemedText>
            <Picker selectedValue={receiveOrPay} onValueChange={(value)=>setReceiveOrPay(value)}
                style={colorScheme=="dark"?BalanceRegisterStyle.pickerDark:BalanceRegisterStyle.pickerLight} dropdownIconColor={"#4654eb"}
                >
                    <Picker.Item label="Earn" value="earn"/>
                    <Picker.Item label="Pay" value="pay"/>
            </Picker>
            <ThemedText style={BalanceRegisterStyle.label}>Account ID: </ThemedText>
            <TextInput value={accountID} onChangeText={setAccountID}
            placeholder="enter email address or other ID"
            style={colorScheme=="dark"?BalanceRegisterStyle.inputDark:BalanceRegisterStyle.inputLight}
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}/>

            <ThemedText style={BalanceRegisterStyle.label}>Transaction name: </ThemedText>
            <TextInput value={transactionName} onChangeText={setTransactionName}
            placeholder="enter Transaction name"
            style={colorScheme=="dark"?BalanceRegisterStyle.inputDark:BalanceRegisterStyle.inputLight}
            placeholderTextColor="#999"/>

            <ThemedText style={BalanceRegisterStyle.label}>Transaction value: </ThemedText>
            <TextInput value={value} onChangeText={setValue}
            placeholder="enter positive, non-zero value"
            style={colorScheme=="dark"?BalanceRegisterStyle.inputDark:BalanceRegisterStyle.inputLight}
            placeholderTextColor="#999"/>

            <ThemedText style={BalanceRegisterStyle.label}>insert personal memo: </ThemedText>
            <TextInput value={memo} onChangeText={setMemo}
            placeholder="enter Personal note"
            style={colorScheme=="dark"?BalanceRegisterStyle.inputDark:BalanceRegisterStyle.inputLight}
            placeholderTextColor="#999"/>

            {/* {
                (value && Number(value) <= -1)?
                <ThemedText style={BalanceRegisterStyle.invalidWarn}>Please enter valid number</ThemedText>
                :<ThemedText></ThemedText>
            } */}

            <ThemedView style={{marginVertical:20, width:"50%"}}>
                <Button title="Select Register Date" color="#a02abd"
                onPress={()=>setShowDatePicker(true)}/>
            </ThemedView>
            <DatePickerModal
                visible={showDatePicker}
                locale="en"
                mode="single"
                onDismiss={()=>setShowDatePicker(false)}
                onConfirm={onDatePickerConfirm}
                date={registerDate}
            />
            <ThemedText>Register Date: {registerDate? registerDate.toDateString():"None"}</ThemedText>

            <ThemedView style={{marginVertical : 20}}>
                <Button title="submit" color = "#a02abd" onPress={handleRegistry}/>
            </ThemedView>
            <ThemedText style={BalanceRegisterStyle.invalidWarn}>{invalidMsg}</ThemedText>
            {/* <ThemedText type='subtitle'>
                {''}
            </ThemedText> */}
            <ThemedText type="subtitle">
                {(registerResponse != undefined)? registerResponse.message:''}
                {/* display the booking response message below submit button */}
            </ThemedText>
        </ThemedView>

    )
}
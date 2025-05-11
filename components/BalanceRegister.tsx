import { Picker } from "@react-native-picker/picker"
import { format } from "date-fns"
import { useState } from "react"
import { Button, TextInput, useWindowDimensions } from "react-native"
import { DatePickerModal } from "react-native-paper-dates"
import BalanceRegisterStyle from "./BalanceRegisterStyle"
import { ThemedText } from "./ThemedText"
import { ThemedView } from "./ThemedView"

export default function VenueBookForm({preSelectedVenueId}:{preSelectedVenueId:string})
{
    const SM_SCREEN = 576
    const {height, width} = useWindowDimensions()
    //registerID is generated as number to define which register was made first
    const [registerID, setRegisterID] = useState('')
    //recieve or pay is a pick value that help user deduct whether they're paying or earning money
    const [receiveOrPay, setReceiveOrPay] = useState('pay')
    const [transactionName, setTransactionName] = useState('')
    const [accountID, setAccountID] = useState('')
    const [value, setValue] = useState('')
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [registerDate, setRegisterDate] = useState<Date|undefined>(undefined)
    const [memo, setMemo] = useState('')
    const [invalidMsg, setInvalidMsg] = useState('')


    const handleRegistry = () => {
        const today = new Date()
        today.setHours(23,59,59,0)
        if(transactionName.trim()===''){
            setInvalidMsg('please enter the transaction name')
        }
        else if(accountID.trim()===''){
            setInvalidMsg('please enter the transaction ID')
        }
        else if(!registerDate || registerDate==undefined){
            setInvalidMsg('Please select register date')
        }
        else if(registerDate>=today){
            setInvalidMsg('you can only register transaction happened today or the day before that')
        }
        else if(value.trim()===''){
            setInvalidMsg('please enter the transaction value')
        }
        
        else{
            setInvalidMsg('')
        }

        if(invalidMsg===''){
            const Register:registerItem = {
                RegisterID: registerID,
                TranactionsName: transactionName,
                AccountID: accountID,
                Value: value,
                Date: (registerDate!=undefined)? format(registerDate,'dd-MM-yyyy'):'',
                Memo: memo
            }
        
        //addRegister({venueId: venueId,
        //    bookItem: booking,
        //    setResponse: setBookResponse
        //})

        //Reset booking form
        setRegisterID('')
        setTransactionName('')
        setReceiveOrPay('pay')
        setAccountID('')
        setValue('')
        setRegisterDate(undefined)
        setMemo('')
        }
    }

    const onDatePickerConfirm = (params: {date:Date|undefined}) =>{
        setShowDatePicker(false)
        setRegisterDate(params.date)
    }
    return(
        <ThemedView style={{width : (width>SM_SCREEN)?"50%":"auto"}}>
            <Picker selectedValue={venueId} onValueChange={(value)=>setVenueId(value)}
                style={BalanceRegisterStyle.picker} dropdownIconColor={"#4654eb"}
                >
                {
                venueData.map((VenueItem)=>(
                    <Picker.Item label={VenueItem.name} value={VenueItem._id}
                    key={VenueItem._id}/>
                )

                )
            }
            </Picker>
            <ThemedText style={BalanceRegisterStyle.label}>Email: </ThemedText>
            <TextInput value={email} onChangeText={(inputText:string)=>{
                setEmail(inputText)
                setIsValidEmail(validateEmail(inputText))
            }}
            placeholder="enter email address"
            style={venueBookStyles.input}
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}/>

            <ThemedText style={BalanceRegisterStyle.label}>Name-Lastname: </ThemedText>
            <TextInput value={transactionName} onChangeText={setTransactionName}
            placeholder="enter name-Lastname"
            style={BalanceRegisterStyle.input}
            placeholderTextColor="#999"/>
            {
                (value && Number(value) <= -1)?
                <ThemedText style={BalanceRegisterStyle.invalidWarn}>Please enter valid number</ThemedText>
                :<ThemedText></ThemedText>
            }

            <ThemedView style={{marginVertical:20, width:"50%"}}>
                <Button title="Select Register Date" color="#8d96fc"
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
                <Button title="Book this venue" color = "#4654eb" onPress={handleBookingSubmit}/>
            </ThemedView>
            <ThemedText style={BalanceRegisterStyle.invalidWarn}>{invalidMsg}</ThemedText>
            <ThemedText type='subtitle'>
                {(bookResponse!=undefined)?bookResponse.message:''}
            </ThemedText>
        </ThemedView>

    )
}
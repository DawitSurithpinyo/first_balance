import { StyleSheet } from "react-native";


///placeholder from other project, will adjust if see fit
const BalanceRegisterStyle = StyleSheet.create(
    {
        titleContainer: {
            paddingVertical: 50,
            alignItems: 'center',
            justifyContent: 'center'
        },
        titleText: {
            fontSize: 50,
            fontWeight: 'bold',
            color: 'white'
        },
        mainContainer: {
            flex: 1
        },
        content: {
            flex: 1,
            padding: 32,
            gap: 16,
            overflow: 'hidden'
        },
        picker:{
            height:50,
            borderWidth:1,
            borderColor: "#ebbaf7",
            borderRadius: 12,
            paddingHorizontal: 10,
            backgroundColor : '#212121',
            fontSize:16,
            color: '#ebbaf7',
            elevation : 2,
            shadowColor : "#000",
            shadowOffset: {width: 0, height:2},
            shadowOpacity: 0.1,
            shadowRadius: 4
        },
        input: {
            height:50,
            borderWidth:1,
            borderColor: "#ebbaf7",
            borderRadius: 12,
            paddingHorizontal: 10,
            backgroundColor : '#212121',
            fontSize:16,
            color: '#ebbaf7',
            elevation : 2,
            shadowColor : "#000",
            shadowOffset: {width: 0, height:2},
            shadowOpacity: 0.1,
            shadowRadius: 4
        },
        label:{
            fontSize:16,
            color: "#ebbaf7",
            marginVertical:6,
            marginLeft: 4
        },
        invalidWarn:{
            fontSize: 14,
            color: '#ff0000'
        }

    }
)

export default BalanceRegisterStyle;
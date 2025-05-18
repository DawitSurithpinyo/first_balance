import { RecordItem, RecordResponseJson } from "@/interface";
import { Platform } from "react-native";

export default function updateRecord({originalRec, newRec, setResponse}:
    {originalRec:RecordItem, newRec:RecordItem, setResponse:Function}
) {
    const updateARecord = async() => {
        try {
            // if npm run android, will need to run with your computer's local IP,
            // which you can get by: when running npm run android, there will be a link like this:
            // exp://<your local IP>:<port number>
            // put <your local IP> here
            const ip = "192.168.212.237"
            var link = "";
            if(Platform.OS === 'web'){
                link = "http://127.0.0.1:5000"
            }
            else if(Platform.OS === 'android'){
                link = `http://${ip}:5000`
            }
                        
            const response = await fetch(`${link}/update_one`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    original: {
                        TransactionName: originalRec.TransactionName,
                        AccountID: originalRec.AccountID,
                        Value: originalRec.Value,
                        Date: originalRec.Date,
                        Memo: originalRec.Memo
                    },
                    newData: {
                        TransactionName: newRec.TransactionName,
                        AccountID: newRec.AccountID,
                        Value: newRec.Value,
                        Date: newRec.Date,
                        Memo: newRec.Memo
                    }
                })
            })
            if(response.ok){
                const json:RecordResponseJson = await response.json();
                setResponse(json)
            }
        }
        catch (error) {
            console.error('Error updating data: ', error);
        }
    };

    updateARecord();
}
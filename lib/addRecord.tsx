import { RecordItem, RecordResponseJson } from "@/interface";
import { Platform } from "react-native";

export default function addRecord({recItem, setResponse}:
    {recItem:RecordItem, setResponse:Function}
) {
    const postRecord = async() => {
        try {
            // if npm run android, will need to run with your computer's local IP,
            // which you can get by: when running npm run android, there will be a link like this:
            // exp://<your local IP>:<port number>
            // put <your local IP> here
            const ip = "192.168.1.49"
            var link = "";
            if(Platform.OS === 'web'){
                link = "http://127.0.0.1:5000"
            }
            else if(Platform.OS === 'android'){
                link = `http://${ip}:5000`
            }
                        
            const response = await fetch(`${link}/get_all_records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    TransactionName: recItem.TransactionName,
                    AccountID: recItem.AccountID,
                    Value: recItem.Value,
                    Date: recItem.Date,
                    Memo: recItem.Memo
                })
            })
            if(response.ok){
                const json:RecordResponseJson = await response.json();
                setResponse(json)
            }
        }
        catch (error) {
            console.error('Error posting data: ', error);
        }
    };

    postRecord();
}
import { Filters, RecordResponseJson } from "@/interface";
import { Platform } from "react-native";

export default function deleteMany({condition, setResponse}:
    {condition:Filters, setResponse:Function}
) {
    const deleteAllRecs = async() => {
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
                        
            const response = await fetch(`${link}/delete_many`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    TransactionName: condition.TransactionNameFilter,
                    AccountID: condition.AccountIDFilter,
                    MinValue: condition.MinValue,
                    MaxValue: condition.MaxValue,
                    StartDate: condition.StartDate,
                    EndDate: condition.EndDate,
                    Memo: condition.MemoFilter
                })
            })
            if(response.ok){
                const json:RecordResponseJson = await response.json();
                setResponse(json)
            }
        }
        catch (error) {
            console.error('Full error:', error);
            setResponse({ error: 'Delete failed' });
        }
    };

    deleteAllRecs();
}
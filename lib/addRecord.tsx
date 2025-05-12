import { RecordItem, RecordResponseJson } from "@/interface";

export default function addRecord({recItem, setResponse}:
    {recItem:RecordItem, setResponse:Function}
) {
    const postRecord = async() => {
        try {
            const response = await fetch("http://127.0.0.1:5000/add_record", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transactionName: recItem.TransactionName,
                    accountID: recItem.AccountID,
                    value: recItem.Value,
                    date: recItem.Date,
                    memo: recItem.Memo
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
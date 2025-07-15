import { RecordJson } from "@/interface";
import { Platform } from "react-native";

export default function getRecords({setRecordsData, userEmail}: {setRecordsData:Function, userEmail:string}) {
    const fetchRecords = async() => {
        try{
            // if npm run android, will need to run with your computer's local IP,
            // which you can get by: when running npm run android, there will be a link like this:
            // exp://<your local IP>:<port number>
            // put <your local IP> here
            const ip = "192.168.212.237"
            var link = "";
            if(Platform.OS === 'web'){
                link = "http://localhost:5000"
            }
            else if(Platform.OS === 'android'){
                link = `http://${ip}:5000`
            }

            const response = await fetch(`${link}/get_all_records`, {
                // If we need to pass a body to back-end, we cannot use GET
                // even though it feels more fitting to use GET
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Email: userEmail.valueOf()
                    // Need the .valueOf()
                    // See https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable
                }),
                credentials: 'include'
            })

            
            if(response.ok) {
                const json:RecordJson = await response.json()
                setRecordsData(json.all_records)
            }
        }
        catch (error){
            console.log("Error fetching data: ", error)
        }
    };

    fetchRecords();
}
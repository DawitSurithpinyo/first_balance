import { RecordJson } from "@/interface";
import { Platform } from "react-native";

export default function getRecords({setRecordsData}: {setRecordsData:Function}) {
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
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
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
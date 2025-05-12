import { RecordJson } from "@/interface";

export default function getRecords({setRecordsData}: {setRecordsData:Function}) {
    const fetchRecords = async() => {
        try{
            const response = await fetch("http://127.0.0.1:5000/get_all_records", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
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
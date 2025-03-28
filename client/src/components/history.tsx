import { useEffect,useState } from "react";
import axios from "axios";

function History(){

    const [history,setHistory] = useState([]);

    useEffect(() => {
        axios.get("/api/chat-history",()=>{
            setHistory(res.data.history);
        })
    },[]);



    return(
        <div>
            <h1>History</h1>
            <div>
                {
                   
                }
            </div>
        </div>
    );

}
export default History;
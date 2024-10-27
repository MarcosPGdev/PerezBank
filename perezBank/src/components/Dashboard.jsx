import Modulo from "./Modulo"
import BankAccounts from "./BankAccounts"
import TransactionTools from "./transacctionTools";
import TransactionTable from "./transactionTable";
import TransactionsBarChart from "./transactionsBarChart";
import './css/dashboard.css'
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function Dashboard(){
    const token = localStorage.getItem('token');
    const [accounts, setAccounts] = useState([]);
    const [controlData, setControlData] = useState(1);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    useEffect(() => {
        axios.get('http://localhost:5000/api/accounts/get_accounts',{params:{token:token}})
        .then(response => {
            console.log(response.data)
            setAccounts(response.data);
        })
        .catch(error => {
            console.error('Error al consultar:', error);
            toast.error(error.response.data);
        });
    }, [controlData]);

    return(
        <div className="pantalla-contenido">
            <Modulo className="modulo large">
                <BankAccounts accounts={accounts} currentSlideIndex={currentSlideIndex} setCurrentSlideIndex={setCurrentSlideIndex} controlData={controlData} setControlData={setControlData}></BankAccounts>
            </Modulo>
            <Modulo className="modulo large-short">
                <h1 className='title-modulo'>Balance disponible</h1>
                {accounts && accounts.userAccounts && accounts.userAccounts.length > 0 ? (
                    <p className='balance'>
                        {accounts.userAccounts[currentSlideIndex].account.Balance + '€'}
                    </p>
                ) : (
                    'Cargando saldo...'
                )}
            </Modulo>
            <Modulo className="modulo large">
                <TransactionsBarChart accounts={accounts} currentSlideIndex={currentSlideIndex}></TransactionsBarChart>
            </Modulo>
            <Modulo className="modulo small-wide">
                <TransactionTools accounts={accounts} currentSlideIndex={currentSlideIndex} controlData={controlData} setControlData={setControlData}/>
            </Modulo>
            <Modulo className="modulo wide">
                <TransactionTable accounts={accounts} currentSlideIndex={currentSlideIndex}></TransactionTable>
            </Modulo>
            <Modulo className="modulo medium-tall">
                
            </Modulo>
        </div>
    )

}


export default Dashboard
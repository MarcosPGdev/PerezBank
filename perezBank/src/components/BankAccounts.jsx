import './css/creditCard.css';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function BankAccounts({accounts, currentSlideIndex, setCurrentSlideIndex, controlData, setControlData}) {
    const settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        beforeChange: (oldIndex, newIndex) => setCurrentSlideIndex(newIndex)
    };

    const createAccount = (accounts) => {
        console.log(accounts)
        axios.post('http://localhost:5000/api/accounts/createAccount',{UserId:accounts.userAccounts[currentSlideIndex].account.UserId})
        .then(response => {
            setControlData(controlData*-1);
            toast.success(response.data.message);
        })
        .catch(error => {
            toast.error(error.response.data);
        });
    }

    return (
        <div className="bankAccounts">
            {accounts && accounts.userAccounts && accounts.userAccounts.length < 3 &&  <button className='createAccButton' onClick={() => createAccount(accounts)}><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" d="M15.5 6H10V.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V6H.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5H6v5.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5V10h5.5a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5"/></svg></button>}
            <h1 className='title-modulo'>Cuentas bancarias</h1>
            {accounts && accounts.userAccounts && accounts.userAccounts.length > 0 ? (
                <Slider {...settings}>
                    {accounts.userAccounts.map((acc, index) => (
                        <div className='accountCard' key={index}>
                            <div className="topAccontCard">
                                <p className='cardText'>Pérez Bank</p>
                                <img src="src/assets/logo.png" alt="logo perez bank" />
                            </div>
                            <div className='midAccountCard'>
                                <img src="src/assets/chip.png" alt="chip perez bank" />
                                <p className='cardText'>{acc.account.AccountNumber}</p>
                            </div>
                            <div className='bottomAccountCard'>
                                <p className='cardText'>{acc.account.Name + ' ' + acc.account.Surname}</p>
                            </div>
                        </div>
                    ))}
                </Slider>
            ) : (
                <p>No hay cuentas disponibles</p>
            )}
        </div>
    );
}

export default BankAccounts;
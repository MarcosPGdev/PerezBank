import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function TransactionTools({ accounts, currentSlideIndex, controlData, setControlData }) {
    const [activeModal, setActiveModal] = useState(null);
    const [transacctionForm, setTransacctionForm] = useState({
        amount: '',
        concept: '',
        originAccount: '',
        destinationAccount: '',
        action: ''
    });

    const openModal = (modalType) => {
        setActiveModal(modalType);
        setTransacctionForm({
            amount: '',
            concept: '',
            originAccount: accounts.userAccounts[currentSlideIndex].account.Id,
            destinationAccount: '',
            action: modalType
        });
    };

    const closeModal = () => {
        setActiveModal(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTransacctionForm(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const doTransaction = () => {
        console.log('Datos de la transacción:', transacctionForm);
        axios.post('http://localhost:5000/api/transactions/transactions', transacctionForm)
        .then(response => {
            toast.success(response.data.message);
            console.log(response.data);
            setControlData(controlData  * -1);
        })
        .catch(error => {
            if (error.response) {
                toast.error(error.response.data.message || 'Ocurrió un error');
            } else if (error.request) {
                toast.error(error.message);
            } else {
                toast.error(error.message);
            }
        });
        closeModal();
    };

    return (
        <div className="containerAcctions">
            <button className="actionButton" onClick={() => openModal('enter')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12a3 3 0 1 0 3 3a3 3 0 0 0-3-3m0 4a1 1 0 1 1 1-1a1 1 0 0 1-1 1m-.71-6.29a1 1 0 0 0 .33.21a.94.94 0 0 0 .76 0a1 1 0 0 0 .33-.21L15 7.46A1 1 0 1 0 13.54 6l-.54.59V3a1 1 0 0 0-2 0v3.59L10.46 6A1 1 0 0 0 9 7.46ZM19 15a1 1 0 1 0-1 1a1 1 0 0 0 1-1m1-7h-3a1 1 0 0 0 0 2h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h3a1 1 0 0 0 0-2H4a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3M5 15a1 1 0 1 0 1-1a1 1 0 0 0-1 1"/></svg>
            </button>
            <button className="actionButton" onClick={() => openModal('transaction')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32"><path fill="currentColor" d="M22.188 2.281L20.78 3.72L25.063 8H4v2h21.063l-4.282 4.281l1.407 1.438L28.905 9zm-12.375 14L3.093 23l6.72 6.719l1.406-1.438L6.938 24H28v-2H6.937l4.282-4.281z"/></svg>
            </button>
            <button className="actionButton" onClick={() => openModal('withdraw')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="m10.46 6l.54-.59V9a1 1 0 0 0 2 0V5.41l.54.55A1 1 0 0 0 15 6a1 1 0 0 0 0-1.42l-2.29-2.29a1 1 0 0 0-.33-.21a1 1 0 0 0-.76 0a1 1 0 0 0-.33.21L9 4.54A1 1 0 0 0 10.46 6M12 12a3 3 0 1 0 3 3a3 3 0 0 0-3-3m0 4a1 1 0 1 1 1-1a1 1 0 0 1-1 1m-7-1a1 1 0 1 0 1-1a1 1 0 0 0-1 1m14 0a1 1 0 1 0-1 1a1 1 0 0 0 1-1m1-7h-4a1 1 0 0 0 0 2h4a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h4a1 1 0 0 0 0-2H4a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3"/></svg>
            </button>

            {activeModal === 'enter' && (
                <div className="modal">
                    <div className="modalContent">
                        <div className="modalHeader">
                            <h2>Ingresar dinero</h2>
                            <button className="closeButton" onClick={closeModal}><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" d="M15.854 12.854L11 8l4.854-4.854a.503.503 0 0 0 0-.707L13.561.146a.5.5 0 0 0-.707 0L8 5L3.146.146a.5.5 0 0 0-.707 0L.146 2.439a.5.5 0 0 0 0 .707L5 8L.146 12.854a.5.5 0 0 0 0 .707l2.293 2.293a.5.5 0 0 0 .707 0L8 11l4.854 4.854a.5.5 0 0 0 .707 0l2.293-2.293a.5.5 0 0 0 0-.707"/></svg></button>
                        </div>
                        <div className="modalBody">
                            <div className="contenedorInput" style={{ width: '100%' }}>
                                <label htmlFor="amount">Cantidad:</label>
                                <input
                                    name="amount"
                                    type="number"
                                    className="input"
                                    value={transacctionForm.amount}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="contenedorInput" style={{ width: '100%' }}>
                                <label htmlFor="concept">Concepto:</label>
                                <textarea
                                    name="concept"
                                    className="input"
                                    value={transacctionForm.concept}
                                    onChange={handleInputChange}
                                ></textarea>
                            </div>
                            <div className="registerButtonContainer">
                                <button className="button" onClick={doTransaction}>
                                    <span className="transition"></span>
                                    <span className="gradient"></span>
                                    <span className="label">Aceptar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'transaction' && (
                <div className="modal">
                    <div className="modalContent">
                        <div className="modalHeader">
                            <h2>Enviar dinero</h2>
                            <button className="closeButton" onClick={closeModal}><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" d="M15.854 12.854L11 8l4.854-4.854a.503.503 0 0 0 0-.707L13.561.146a.5.5 0 0 0-.707 0L8 5L3.146.146a.5.5 0 0 0-.707 0L.146 2.439a.5.5 0 0 0 0 .707L5 8L.146 12.854a.5.5 0 0 0 0 .707l2.293 2.293a.5.5 0 0 0 .707 0L8 11l4.854 4.854a.5.5 0 0 0 .707 0l2.293-2.293a.5.5 0 0 0 0-.707"/></svg></button>
                        </div>
                        <div className="modalBody">
                            <div className="contenedorInput" style={{ width: '100%' }}>
                                <label htmlFor="destinationAccount">Número de cuenta:</label>
                                <input
                                    name="destinationAccount"
                                    type="text"
                                    className="input"
                                    value={transacctionForm.destinationAccount}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="contenedorInput" style={{ width: '100%' }}>
                                <label htmlFor="amount">Cantidad:</label>
                                <input
                                    name="amount"
                                    type="number"
                                    className="input"
                                    value={transacctionForm.amount}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="contenedorInput" style={{ width: '100%' }}>
                                <label htmlFor="concept">Concepto:</label>
                                <textarea
                                    name="concept"
                                    className="input"
                                    value={transacctionForm.concept}
                                    onChange={handleInputChange}
                                ></textarea>
                            </div>
                            <div className="registerButtonContainer">
                                <button className="button" onClick={doTransaction}>
                                    <span className="transition"></span>
                                    <span className="gradient"></span>
                                    <span className="label">Aceptar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'withdraw' && (
                <div className="modal">
                    <div className="modalContent">
                        <div className="modalHeader">
                            <h2>Retirar dinero</h2>
                            <button className="closeButton" onClick={closeModal}><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" d="M15.854 12.854L11 8l4.854-4.854a.503.503 0 0 0 0-.707L13.561.146a.5.5 0 0 0-.707 0L8 5L3.146.146a.5.5 0 0 0-.707 0L.146 2.439a.5.5 0 0 0 0 .707L5 8L.146 12.854a.5.5 0 0 0 0 .707l2.293 2.293a.5.5 0 0 0 .707 0L8 11l4.854 4.854a.5.5 0 0 0 .707 0l2.293-2.293a.5.5 0 0 0 0-.707"/></svg></button>
                        </div>
                        <div className="modalBody">
                            <div className="contenedorInput" style={{ width: '100%' }}>
                                <label htmlFor="amount">Cantidad:</label>
                                <input
                                    name="amount"
                                    type="number"
                                    className="input"
                                    value={transacctionForm.amount}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="contenedorInput" style={{ width: '100%' }}>
                                <label htmlFor="concept">Concepto:</label>
                                <textarea
                                    name="concept"
                                    className="input"
                                    value={transacctionForm.concept}
                                    onChange={handleInputChange}
                                ></textarea>
                            </div>
                            <div className="registerButtonContainer">
                                <button className="button" onClick={doTransaction}>
                                    <span className="transition"></span>
                                    <span className="gradient"></span>
                                    <span className="label">Aceptar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TransactionTools;
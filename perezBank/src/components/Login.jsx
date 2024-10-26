import { useState } from "react";
import './css/login.css'
import LoginForm from "./LoginForm";
import RegisterForm from "./registerForm";

function LoginScreen ({onLoginSuccess}){
    const [loginState, setloginState] = useState(0)
    console.log(loginState);
    const changeLoginState = (state) => {
      setloginState(state);
    }
    return(
       <div className='containerLogin'>
           <div className='loginHeader'>
               <img src="src/assets/logo.png" alt="logo perez bank" />
               <div className='containerHeaderButtons'>
               <button className='headerButton' onClick={()=> changeLoginState(1)}>iniciar sesión</button>
               <button className='headerButton activateBg' onClick={()=>changeLoginState(2)}>Registrarse</button>
               </div>
           </div>
           <div className='loginScreen'>
               <div className='loginPresentation'>
               <h1>PÉREZ BANK</h1>
               <br />
               <h3><span>CREA</span> TU CUENTA DE BANCO EN MINUTOS Y <span>COMIENZA</span> A TRANSACCIONAR DESDE <span>YA</span>!</h3>
               </div>
               {loginState == 0 &&
                    <div className="creditCardContainer">
                        <img className="creditCard" src="src/assets/cards.png" alt="" />
                    </div>
               }
               {loginState == 1 &&
                    <LoginForm onLoginSuccess={onLoginSuccess} />
               }
               {loginState == 2 &&
                    <RegisterForm />
               }
           </div>
        </div>
    )

}

export default LoginScreen
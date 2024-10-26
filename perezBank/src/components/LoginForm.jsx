import { useState } from "react"
import { useEffect } from "react"
import axios from "axios";
import { toast } from "react-toastify";

function LoginForm({onLoginSuccess}){
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        // Hacer que el componente sea visible al montarse
        setIsVisible(true);
    }, []);

    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
      
    const handleChange = (name) => {
        setFormData({
            ...formData,
            [name.target.name]: name.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
        
        axios.post('http://localhost:5000/login', formData)
        .then(response => {
              console.log('Registro exitoso:', response.data);
              localStorage.setItem('token', response.data.token);
              toast.success('Login correcto');
              onLoginSuccess();
        })
        .catch(error => {
            let Attempts = parseInt(localStorage.getItem("Attempts"));
            if(Attempts+1 == 3){
                axios.post('http://localhost:5000/blockAccount', formData)
                .then(response => {
                    toast.error(response.data.message);
                    localStorage.clear();
                })
            }else if(Attempts){
                localStorage.setItem("Attempts", Attempts+1);
                toast.error(error.response.data.message);
            }else{
                localStorage.setItem("Attempts", 1);
                toast.error(error.response.data.message);
            }
        });
    };
      
    return(
        <form onSubmit={handleSubmit} className={`contenedorForm ${isVisible ? "fade-in" : ""}`}>
            <h2 style={{textAlign:"center", width:"100%"}}>INICIAR SESIÓN</h2>
            <div className="contenedorInput" style={{width:'100%'}}>
                <label htmlFor="username">Usuario:</label>
                <input name="username" type="text" value={formData.username} onChange={handleChange} className="input" />
            </div>
            <div className="contenedorInput" style={{width:'100%'}}>
                <label htmlFor="password">Contraseña:</label>
                <input name="password" type="password"  value={formData.password} onChange={handleChange} className="input" />
            </div>
            <div className="registerButtonContainer">
                <button className="button" type="submit">
                    <span className="transition"></span>
                    <span className="gradient"></span>
                    <span className="label">Aceptar</span>
                </button>
            </div>
        </form>
    )
}


export default LoginForm
import './css/modulo.css'
const Modulo = ({style, children, className}) => {
    return(
        <div className={className} style={style}>
            {children}
        </div>
    )
}


export default Modulo
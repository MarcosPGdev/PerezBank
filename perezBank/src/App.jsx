import { useState } from 'react'
import {useEffect} from 'react'
import LoginScreen from './components/Login'
import Dashboard from './components/Dashboard'
import ToolBar from './components/ToolBar'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const logOut = () => {
      localStorage.clear();
      setIsAuthenticated(false);
  }

  return (
    <div>
      {isAuthenticated ? 
      <main className="pantalla">
          <div className='screen-header'>
              <h1 className='title-header'>Pérez Bank</h1>
              <button onClick={() => logOut()} className='unsetButton'><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M16 13v-2H7V8l-5 4l5 4v-3z"/><path fill="currentColor" d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2"/></svg></button>
          </div>
          <div className='screen-body'>
              <ToolBar/> 
              <Dashboard/>
          </div>
      </main>
      : <LoginScreen onLoginSuccess={handleLoginSuccess} />}
    </div>
  );
}

export default App

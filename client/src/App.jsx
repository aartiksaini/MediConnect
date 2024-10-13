import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { Profile } from './pages/Profile';
import { Signup } from './pages/Signup';
import { Login } from './pages/Login';
import { History } from './pages/History';
import { Landing } from './pages/Landing';
import DoctorDetails from './pages/Doctordetails';

const App= () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing></Landing>} />
         <Route path="/signup" element={<Signup></Signup>} />
         <Route path="/signin" element={<Login></Login>} /> 
        <Route path="/profile" element={<Profile />} />
        <Route path='/history' element={<History></History>}></Route>
        <Route path='doctor/:id' element={<DoctorDetails></DoctorDetails>}></Route> 
      </Routes>
    </Router>
  );
};

export default App;
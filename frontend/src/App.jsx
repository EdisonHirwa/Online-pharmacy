import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeContextProvider } from './context/ThemeContext';
import { CssBaseline } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Users from './pages/Users';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';

import DoctorOverview from './pages/doctor/DoctorOverview';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorLabOrders from './pages/doctor/DoctorLabOrders';

import PatientOverview from './pages/patient/PatientOverview';
import PatientFindDoctors from './pages/patient/PatientFindDoctors';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import PatientLabResults from './pages/patient/PatientLabResults';
import PatientBilling from './pages/patient/PatientBilling';

import LabDashboard from './pages/LabDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import HomeRedirect from './components/HomeRedirect';

function App() {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/audit_logs" element={<AuditLogs />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
              <Route path="/doctor" element={<DoctorOverview />} />
              <Route path="/doctor/schedule" element={<DoctorSchedule />} />
              <Route path="/doctor/patients" element={<DoctorPatients />} />
              <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
              <Route path="/doctor/lab-orders" element={<DoctorLabOrders />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
              <Route path="/patient" element={<PatientOverview />} />
              <Route path="/patient/find-doctors" element={<PatientFindDoctors />} />
              <Route path="/patient/appointments" element={<PatientAppointments />} />
              <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
              <Route path="/patient/lab-results" element={<PatientLabResults />} />
              <Route path="/patient/billing" element={<PatientBilling />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['lab_technician']} />}>
              <Route path="/lab/*" element={<LabDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['pharmacist']} />}>
              <Route path="/pharmacy/*" element={<PharmacyDashboard />} />
            </Route>

            <Route path="/" element={<HomeRedirect />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeContextProvider>
  );
}

export default App;

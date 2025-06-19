import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminRoot: React.FC = () => {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminRoot; 
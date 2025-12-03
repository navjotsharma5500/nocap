import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { StudentView } from '@/components/student/StudentView';
import { SocietyEBView } from '@/components/society-eb/SocietyEBView';
import { PresidentView } from '@/components/society-president/PresidentView';
import { FacultyAdminView } from '@/components/faculty-admin/FacultyAdminView';
import { GuardView } from '@/components/guard/GuardView';
import { UserRole } from '@/types/campuspass';

const Index = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('Student');

  const renderView = () => {
    switch (currentRole) {
      case 'Student':
        return <StudentView />;
      case 'Society_EB':
        return <SocietyEBView />;
      case 'Society_President':
        return <PresidentView />;
      case 'Faculty_Admin':
        return <FacultyAdminView />;
      case 'Guard':
        return <GuardView />;
      default:
        return <StudentView />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentRole={currentRole} onRoleChange={setCurrentRole} />
      {renderView()}
    </div>
  );
};

export default Index;

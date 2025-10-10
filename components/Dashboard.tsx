import React from 'react';
import { UserProfile, Project, DprTask } from '../types';
import IndividualDashboard from './dashboards/IndividualDashboard';
import TeamDashboard from './dashboards/TeamDashboard';
import OrganizationDashboard from './dashboards/OrganizationDashboard';

interface DashboardProps {
    viewedUser: UserProfile;
    currentUser: UserProfile;
    allUsers: UserProfile[];
    allProjects: Project[];
    allDprTasks: DprTask[];
    onDashboardVisit: (userId: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ viewedUser, currentUser, allUsers, allProjects, allDprTasks, onDashboardVisit }) => {
    
    const userRole = (() => {
        const title = viewedUser.title.toLowerCase();
        if (title.includes('(admin)')) return 'admin';
        if (title.includes('(staff)')) return 'staff';
        return 'user';
    })();
    
    // Calculate division average for the individual dashboard
    const divisionUsers = allUsers.filter(u => u.division === viewedUser.division);
    const divisionAverage = divisionUsers.length > 0 ? Math.round(
        divisionUsers.reduce((acc, u) => acc + u.score, 0) / divisionUsers.length
    ) : 0;

    switch (userRole) {
        case 'admin':
            return <OrganizationDashboard allUsers={allUsers} projects={allProjects} />;
        case 'staff':
            const teamMembers = allUsers.filter(u => u.division === viewedUser.division && u.id !== viewedUser.id);
            const managedProjects = allProjects.filter(p => p.team.includes(viewedUser.id));
            return <TeamDashboard manager={viewedUser} teamMembers={teamMembers} projects={managedProjects} allUsers={allUsers} />;
        case 'user':
        default:
            return <IndividualDashboard 
                        userProfile={viewedUser} 
                        divisionAverage={divisionAverage} 
                        isCurrentUser={viewedUser.id === currentUser.id}
                        onDashboardVisit={onDashboardVisit}
                        dprTasks={allDprTasks.filter(t => t.userId === viewedUser.id)}
                        allProjects={allProjects}
                    />;
    }
};

export default Dashboard;
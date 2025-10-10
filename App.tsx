import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import { UserProfile, Project, Report, Appeal, AppraisalContent, DprTask } from './types';

import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProjectsPage from './components/pages/ProjectsPage';
import FilesPage from './components/pages/FilesPage';
import ReportsPage from './components/pages/ReportsPage';
import AppealsPage from './components/pages/AppealsPage';
import SepealsPage from './components/pages/SepealsPage';
import AppraisalPage from './components/pages/AppraisalPage';
import AlertsPage from './components/pages/AlertsPage';
import AdminPage from './components/pages/AdminPage';
import SettingsPage from './components/pages/SettingsPage';
import HelpPage from './components/pages/HelpPage';
import DprPage from './components/pages/DprPage';

const App: React.FC = () => {
    const [authView, setAuthView] = useState<'login' | 'signup' | 'app'>('login');
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [viewedUser, setViewedUser] = useState<UserProfile | null>(null);
    const [currentPage, setCurrentPage] = useState('dashboard');

    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [allReports, setAllReports] = useState<Report[]>([]);
    const [allAppeals, setAllAppeals] = useState<Appeal[]>([]);
    const [appraisalContent, setAppraisalContent] = useState<AppraisalContent | null>(null);
    const [allDprTasks, setAllDprTasks] = useState<DprTask[]>([]);
    const [dprTableExists, setDprTableExists] = useState(true);


    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const usersPromise = supabase.from('profiles').select('*');
        const projectsPromise = supabase.from('projects').select('*');
        const reportsPromise = supabase.from('reports').select('*');
        const appealsPromise = supabase.from('appeals').select('*');
        const appraisalPromise = supabase.from('appraisal_content').select('*').limit(1).single();
        const dprTasksPromise = supabase.from('dpr_tasks').select('*');

        const [
            { data: users, error: usersError },
            { data: projects, error: projectsError },
            { data: reports, error: reportsError },
            { data: appeals, error: appealsError },
            { data: appraisal, error: appraisalError },
            { data: dprTasks, error: dprTasksError },
        ] = await Promise.all([usersPromise, projectsPromise, reportsPromise, appealsPromise, appraisalPromise, dprTasksPromise]);
        
        let mappedUsers: UserProfile[] = [];
        if (usersError) console.error('Error fetching users:', usersError);
        else {
             mappedUsers = (users || []).map((user: any) => ({
                ...user,
                activityLog: user.activity_log || [],
             }));
            setAllUsers(mappedUsers);
        }
        
        let mappedProjects: Project[] = [];
        if (projectsError) console.error('Error fetching projects:', projectsError);
        else {
            mappedProjects = projects || [];
            setAllProjects(mappedProjects);
        }

        if (reportsError) console.error('Error fetching reports:', reportsError);
        else {
            // FIX: Map snake_case from DB to camelCase for the frontend
            const mappedReports = (reports || []).map((report: any) => ({ ...report, generatedById: report.generated_by_id }));
            setAllReports(mappedReports);
        }
        
        if (appealsError) console.error('Error fetching appeals:', appealsError);
        else {
            let finalAppeals = (appeals || []).map((appeal: any) => ({
                ...appeal,
                recipientId: appeal.recipient_id,
            }));

            // If no appeals exist, add some mock data for demonstration
            if (finalAppeals.length === 0 && users && users.length > 0) {
                const adminUser = users.find(u => u.title.includes('(Admin)')) || users[0];
                const regularUser = users.find(u => !u.title.includes('(Admin)')) || users[0];

                const mockAppeals: Appeal[] = [
                    {
                        id: 9001,
                        subject: 'Request for Review: Q3 Score Calculation',
                        recipientId: adminUser.id,
                        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        status: 'Pending Review',
                        assigned: regularUser.name,
                    },
                    {
                        id: 9002,
                        subject: 'Memo: Upcoming Holiday Schedule',
                        recipientId: regularUser.id,
                        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        status: 'Completed',
                        assigned: adminUser.name,
                    }
                ];
                finalAppeals = mockAppeals;
            }
            setAllAppeals(finalAppeals);
        }
        
        if (appraisalError) console.error('Error fetching appraisal content:', appraisalError);
        else setAppraisalContent(appraisal || null);
        
        const generateMockDprTasks = (usersList: UserProfile[], projectsList: Project[]): DprTask[] => {
            if (usersList.length > 0 && projectsList.length > 0) {
                const user1 = usersList.find(u => !u.title.includes('(Admin)')) || usersList[0];
                const user2 = usersList.find(u => u.id !== user1.id && !u.title.includes('(Admin)')) || usersList[1] || usersList[0];
                const project1 = projectsList[0];
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                return [
                    { id: 101, userId: user1.id, taskDate: today, description: 'Drafted the preliminary report for Phase 1.', status: 'Completed', projectId: project1.id },
                    { id: 102, userId: user1.id, taskDate: today, description: 'Followed up with the vendor regarding equipment delivery.', status: 'Pending', projectId: project1.id },
                    { id: 103, userId: user1.id, taskDate: yesterday, description: 'Conducted site visit at the Highway 37 location.', status: 'Approved', projectId: project1.id },
                    { id: 104, userId: user2.id, taskDate: today, description: 'Analyzed the soil sample data.', status: 'Completed', projectId: project1.id },
                    { id: 105, userId: user2.id, taskDate: yesterday, description: 'Prepared the weekly progress slides.', status: 'Rejected', mentorNotes: 'Please include the budget utilization data.', projectId: project1.id },
                ];
            }
            return [];
        };

        if (dprTasksError) {
            console.error('Error fetching DPR tasks (falling back to mock data):', dprTasksError.message);
            setDprTableExists(false);
            const mockTasks = generateMockDprTasks(mappedUsers, mappedProjects);
            setAllDprTasks(mockTasks);
        } else {
            setDprTableExists(true);
            let finalDprTasks = (dprTasks || []).map((task: any) => ({
                ...task,
                userId: task.user_id,
                taskDate: task.task_date,
                mentorNotes: task.mentor_notes,
                projectId: task.project_id,
            }));

            if (finalDprTasks.length === 0 && dprTableExists) {
                // Do not generate mock tasks if the table exists but is just empty
            } else if (finalDprTasks.length === 0) {
                 finalDprTasks = generateMockDprTasks(mappedUsers, mappedProjects);
            }
            setAllDprTasks(finalDprTasks);
        }


        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLogin = (user: UserProfile) => {
        setCurrentUser(user);
        setViewedUser(user);
        setAuthView('app');
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setViewedUser(null);
        setAuthView('login');
    };
    
    const handleUpdateUser = async (updatedUser: UserProfile) => {
        const { error } = await supabase.from('profiles').update(updatedUser).eq('id', updatedUser.id);
        if (error) {
            alert("Failed to update profile: " + error.message);
        } else {
            alert("Profile updated successfully!");
            // Update state locally for immediate feedback
            setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
            if (currentUser?.id === updatedUser.id) {
                setCurrentUser(updatedUser);
            }
             if (viewedUser?.id === updatedUser.id) {
                setViewedUser(updatedUser);
            }
        }
    };

    const handleAdminUpdateUser = async (updatedUser: UserProfile) => {
        const { error } = await supabase.from('profiles').update({
          name: updatedUser.name,
          title: updatedUser.title,
          email: updatedUser.email,
          division: updatedUser.division,
          region: updatedUser.region,
          // FIX: The property on the UserProfile object is camelCased.
          quantitative_kpis: updatedUser.quantitativeKpis,
          tasks: updatedUser.tasks,
        }).eq('id', updatedUser.id);
        if (error) {
            alert("Failed to update profile: " + error.message);
        } else {
            alert("Profile updated successfully!");
            await fetchData();
        }
    };

    const handleSaveProjectAssignments = async (userId: number, assignments: Record<number, boolean>) => {
        const updates = allProjects.map(async project => {
            const isAssigned = assignments[project.id];
            const isCurrentlyOnTeam = project.team.includes(userId);

            if (isAssigned && !isCurrentlyOnTeam) {
                const newTeam = [...project.team, userId];
                return supabase.from('projects').update({ team: newTeam }).eq('id', project.id);
            } else if (!isAssigned && isCurrentlyOnTeam) {
                const newTeam = project.team.filter(id => id !== userId);
                return supabase.from('projects').update({ team: newTeam }).eq('id', project.id);
            }
            return Promise.resolve({ error: null });
        });

        const results = await Promise.all(updates);
        const errors = results.filter(r => r.error);

        if (errors.length > 0) {
            alert(`Failed to update some project assignments: ${errors.map(e => e.error?.message).join(', ')}`);
        } else {
            alert("Project assignments saved successfully!");
            await fetchData();
        }
    };
    
     const handleCreateAppeals = async (subject: string, recipientIds: number[]) => {
        if (!currentUser) return;
        // FIX: Use snake_case for the database insert
        const newAppeals = recipientIds.map(id => ({
            subject: subject,
            recipient_id: id,
            date: new Date().toISOString(),
            status: 'Pending Review' as Appeal['status'],
            assigned: currentUser.name,
        }));

        const { error } = await supabase.from('appeals').insert(newAppeals);
        if (error) {
            alert('Failed to create appeals: ' + error.message);
        } else {
            alert('Appeals sent successfully!');
            await fetchData();
        }
    };
    
    const handleUpdateAppealStatus = async (appealId: number, status: Appeal['status']) => {
        const { error } = await supabase.from('appeals').update({ status }).eq('id', appealId);
        if (error) {
            alert('Failed to update appeal: ' + error.message);
        } else {
             // Optimistic update
            setAllAppeals(prev => prev.map(a => a.id === appealId ? { ...a, status } : a));
        }
    };
    
     const handleUpdateAppraisalContent = async (newContent: Omit<AppraisalContent, 'id'>) => {
        if (!appraisalContent) return;
        const { error } = await supabase.from('appraisal_content').update(newContent).eq('id', appraisalContent.id);
        if (error) {
            alert('Failed to update content: ' + error.message);
        } else {
            alert('Content updated!');
            await fetchData();
        }
    };

    const handleSendAlert = async (recipientEmail: string, subject: string, message: string) => {
        // This is a placeholder as we can't send real emails from the client.
        // In a real app, this would call a Supabase Edge Function.
        alert(`Simulating sending email to ${recipientEmail}:\n\nSubject: ${subject}\n\nMessage: ${message}`);
    };

    const handleCreateDprTask = async (task: Omit<DprTask, 'id' | 'status'>) => {
        if (!dprTableExists) {
            const newMockTask: DprTask = {
                ...task,
                id: Date.now(), // simple unique ID for mock
                status: 'Pending',
                mentorNotes: undefined,
            };
            setAllDprTasks(prev => [...prev, newMockTask]);
            alert('Task added to local demo data. To persist data, create the `dpr_tasks` table in Supabase.');
            return;
        }

        const { error } = await supabase.from('dpr_tasks').insert([{
            user_id: task.userId,
            task_date: task.taskDate,
            description: task.description,
            project_id: task.projectId,
            status: 'Pending',
        }]).select();

        if (error) {
            alert('Failed to create task: ' + error.message);
        } else {
            alert('Task added successfully!');
            await fetchData(); // Refresh all data
        }
    };

    const handleUpdateDprTask = async (taskId: number, newStatus: DprTask['status'], mentorNotes?: string) => {
         if (!dprTableExists) {
            setAllDprTasks(prev => prev.map(t =>
                t.id === taskId
                    ? { ...t, status: newStatus, mentorNotes: mentorNotes || t.mentorNotes }
                    : t
            ));
            return;
        }

        const updateData: { status: DprTask['status'], mentor_notes?: string } = { status: newStatus };
        if (mentorNotes) {
            updateData.mentor_notes = mentorNotes;
        }

        const { error } = await supabase.from('dpr_tasks').update(updateData).eq('id', taskId);

        if (error) {
            alert('Failed to update task: ' + error.message);
        } else {
            // Fetch latest data to ensure UI is in sync with DB
            await fetchData();
        }
    };

    const handleDashboardVisit = useCallback(async (userId: number) => {
        const user = allUsers.find(u => u.id === userId);
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];
        const activityLog = user.activityLog || [];
        const hasActivityToday = activityLog.some(entry => entry.date === today);

        // Only log the visit if no other activity has been recorded for the day.
        if (!hasActivityToday) {
            const updatedLog = [...activityLog, { date: today, count: 1 }];
            const { error } = await supabase.from('profiles').update({ activity_log: updatedLog }).eq('id', userId);
            if (error) {
                console.error('Failed to log dashboard visit:', error.message);
            } else {
                // Refresh data to reflect the change immediately
                await fetchData();
            }
        }
    }, [allUsers, fetchData]);


    if (authView === 'login') {
        return <LoginPage onLogin={handleLogin} allUsers={allUsers} onSwitchToSignup={() => setAuthView('signup')} />;
    }

    if (authView === 'signup') {
        return <SignupPage onSignupSuccess={() => { fetchData(); setAuthView('login'); }} onSwitchToLogin={() => setAuthView('login')} />;
    }

    if (!currentUser || !viewedUser || loading) {
        return <div className="flex items-center justify-center h-screen bg-brand-bg"><p>Loading application...</p></div>;
    }

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard viewedUser={viewedUser} currentUser={currentUser} allUsers={allUsers} allProjects={allProjects} allDprTasks={allDprTasks} onDashboardVisit={handleDashboardVisit} />;
            case 'dpr':
                return <DprPage viewedUser={viewedUser} allUsers={allUsers} allProjects={allProjects} allDprTasks={allDprTasks} onCreateTask={handleCreateDprTask} onUpdateTask={handleUpdateDprTask} />;
            case 'projects':
                return <ProjectsPage viewedUser={viewedUser} allProjects={allProjects} allUsers={allUsers} refreshProjects={fetchData} />;
            case 'files':
                return <FilesPage viewedUser={viewedUser} />;
            case 'reports':
                return <ReportsPage viewedUser={viewedUser} initialReports={allReports} refreshReports={fetchData} />;
            case 'appeals':
                return <AppealsPage viewedUser={viewedUser} allUsers={allUsers} allAppeals={allAppeals} onCreateAppeals={handleCreateAppeals} onUpdateAppealStatus={handleUpdateAppealStatus} />;
             case 'sepeals':
                return <SepealsPage />;
             case 'appraisals':
                return <AppraisalPage allUsers={allUsers} viewedUser={viewedUser} content={appraisalContent} onUpdateContent={handleUpdateAppraisalContent} />;
            case 'alerts':
                return <AlertsPage allUsers={allUsers} viewedUser={viewedUser} onSendAlert={handleSendAlert} />;
            case 'admin':
                return <AdminPage allUsers={allUsers} allProjects={allProjects} refreshUsers={fetchData} onAdminUpdateUser={handleAdminUpdateUser} onSaveProjectAssignments={handleSaveProjectAssignments} />;
            case 'settings':
                return <SettingsPage currentUser={currentUser} onUpdateUser={handleUpdateUser} />;
            case 'help':
                return <HelpPage />;
            default:
                return <Dashboard viewedUser={viewedUser} currentUser={currentUser} allUsers={allUsers} allProjects={allProjects} allDprTasks={allDprTasks} onDashboardVisit={handleDashboardVisit} />;
        }
    };
    
    return (
        <div className="flex h-screen bg-brand-bg text-brand-dark">
            <Sidebar 
                user={currentUser} 
                currentPage={currentPage}
                onNavigate={setCurrentPage} 
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    currentUser={currentUser} 
                    viewedUser={viewedUser} 
                    setViewedUser={setViewedUser}
                    allUsers={allUsers}
                    onLogout={handleLogout}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-bg p-8">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default App;
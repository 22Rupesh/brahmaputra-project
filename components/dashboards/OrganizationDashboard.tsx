import React, { useState, useMemo } from 'react';
// @ts-ignore
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { UserProfile, Project } from '../../types';
import Modal from '../Modal';
import StatCard from '../StatCard';
import ContributionGraph from '../ContributionGraph';

interface OrganizationDashboardProps {
    allUsers: UserProfile[];
    projects: Project[];
}

const OrganizationDashboard: React.FC<OrganizationDashboardProps> = ({ allUsers, projects }) => {
    
    const [isKpiModalOpen, setKpiModalOpen] = useState(false);
    const [isAuditModalOpen, setAuditModalOpen] = useState(false);

    const aggregatedActivity = useMemo(() => {
        const activityMap: { [date: string]: number } = {};
        allUsers.forEach(member => {
            (member.activityLog || []).forEach(log => {
                if (activityMap[log.date]) {
                    activityMap[log.date] += log.count;
                } else {
                    activityMap[log.date] = log.count;
                }
            });
        });

        return Object.entries(activityMap).map(([date, count]) => ({ date, count }));
    }, [allUsers]);

    // A. Organizational Overview
    const OrganizationalOverview = () => {
        const divisions = [...new Set(allUsers.map(u => u.division))];
        const divisionData = divisions.map(div => {
            const members = allUsers.filter(u => u.division === div);
            const avgScore = members.reduce((acc, m) => acc + m.score, 0) / members.length;
            return { name: div, score: Math.round(avgScore) };
        });

        const trendData = [
            { name: 'Q1', score: 75 }, { name: 'Q2', score: 78 },
            { name: 'Q3', score: 81 }, { name: 'Q4', score: 82 },
        ];
        
        const orgAvg = Math.round(allUsers.reduce((acc, u) => acc + u.score, 0) / allUsers.length);

        return (
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-brand-dark mb-4">Organizational Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <StatCard title="Overall Productivity Score" value={orgAvg} change="+1 vs Q3" changeType="increase" />
                   <StatCard title="Total Personnel" value={allUsers.length} />
                </div>
                 <div className="h-40 mt-4">
                     <p className="text-sm font-semibold text-center text-gray-600 mb-1">Quarterly Performance Trend</p>
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <XAxis dataKey="name" tick={{fontSize: 12}} />
                                <YAxis domain={[70, 90]} hide/>
                                <Tooltip />
                                <Line type="monotone" dataKey="score" stroke="#38b2ac" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                 <h4 className="font-semibold text-gray-700 mt-4">Division Performance</h4>
                 <div className="h-48">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={divisionData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                            <XAxis dataKey="name" tick={{fontSize: 12}}/>
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="score" fill="#38b2ac" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    // B. KPI Monitoring
    const KpiMonitor = () => (
         <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-brand-dark mb-4">⚙️ KPI Monitoring</h3>
            <div className="space-y-4">
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3">
                    <p className="font-bold">AI Suggestion</p>
                    <p className="text-sm">Consider adding a 'Budget Adherence' KPI for the Design division to improve financial tracking.</p>
                </div>
                <button onClick={() => setKpiModalOpen(true)} className="w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-dark hover:bg-brand-medium transition-colors">
                   Manage KPI Policies
                </button>
            </div>
        </div>
    );
    
    // C. Strategic Insights
    const StrategicInsights = () => {
        const atRiskProjects = projects.filter(p => p.status !== 'On Time');
        const regionScores = ['North', 'South', 'East', 'West'].map(r => {
             const members = allUsers.filter(u => u.region === r);
             const score = members.length ? Math.round(members.reduce((acc, m) => acc + m.score, 0) / members.length) : 0;
             return { region: r, score };
        });

        return (
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-brand-dark mb-4">🧭 Strategic Insights</h3>
                 <div className="space-y-3">
                    <div className="bg-red-100 p-3 rounded-md">
                        <h4 className="font-semibold text-red-800">Projects at Risk ({atRiskProjects.length})</h4>
                        <ul className="text-sm text-red-700 list-disc list-inside">
                          {atRiskProjects.map(p => <li key={p.id}>{p.name} ({p.status})</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700">Productivity Heatmap (By Region)</h4>
                        <div className="flex justify-between mt-1 text-sm">
                            {regionScores.map(r => <div key={r.region} className="text-center"><p className="font-bold text-brand-accent">{r.score}</p><p>{r.region}</p></div>)}
                        </div>
                    </div>
                    <p className="text-sm text-center pt-2 text-gray-500"><strong>Prediction:</strong> Next quarter performance drop likely in Field Operations due to project delays.</p>
                 </div>
            </div>
        );
    };
    
    // D. HR & Policy Integration
    const HrIntegration = () => {
        const rankedUsers = [...allUsers].sort((a, b) => b.score - a.score);
        return (
             <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-brand-dark mb-4">🧑‍💻 HR & Policy Integration</h3>
                <div>
                     <h4 className="font-semibold text-gray-700 mb-2">Productivity Ranking (Top 3)</h4>
                     <ol className="list-decimal list-inside text-sm space-y-1">
                        {rankedUsers.slice(0,3).map(u => <li key={u.id}>{u.name} - {u.score}</li>)}
                     </ol>
                </div>
                 <div className="mt-4">
                     <h4 className="font-semibold text-gray-700 mb-2">Employees for Training</h4>
                     <p className="text-sm text-gray-600">Vikram Singh (Low Report Submission)</p>
                     <p className="text-sm text-gray-600">Suresh Gupta (High Audit Queries)</p>
                </div>
            </div>
        )
    };
    
    // E. Governance & Audit
    const Governance = () => (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-brand-dark mb-4">🔐 Governance & Audit</h3>
            <div className="space-y-3">
                <button onClick={() => setAuditModalOpen(true)} className="w-full text-sm text-blue-600 hover:underline">View Audit Log</button>
                <button className="w-full text-sm text-blue-600 hover:underline">Download Monthly Report</button>
                 <div className="bg-gray-100 p-3 rounded-md">
                    <h4 className="font-semibold text-gray-800 text-sm">Pending Approval</h4>
                    <p className="text-xs text-gray-600">New KPI policy for 'Finance' division.</p>
                </div>
            </div>
        </div>
    );
    

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-brand-dark">Organization HQ Dashboard</h2>
                 <p className="text-brand-light">Top-level view of all personnel performance.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <ContributionGraph activityData={aggregatedActivity} title="Organization-wide Activity" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <OrganizationalOverview />
                <StrategicInsights />
                <HrIntegration />
                <KpiMonitor />
                <Governance />
            </div>

            <Modal isOpen={isKpiModalOpen} onClose={() => setKpiModalOpen(false)} title="KPI Policy Management">
                <p>Centrally define, modify, and control weightages for role-specific KPIs here. This interface ensures standardized performance measurement across the organization.</p>
                 <div className="mt-4 text-right space-x-2">
                    <button className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded text-sm">Add KPI</button>
                    <button className="bg-brand-accent text-white font-bold py-2 px-4 rounded text-sm">Save Changes</button>
                </div>
            </Modal>
            <Modal isOpen={isAuditModalOpen} onClose={() => setAuditModalOpen(false)} title="Audit Log">
                <ul className="text-sm space-y-2">
                    <li>[2024-09-10 11:45] Rajesh Kumar updated 'Site Visits' KPI weightage.</li>
                    <li>[2024-09-08 15:20] Anita Sharma approved 'Highway 37' milestone completion.</li>
                    <li>[2024-09-07 09:00] System auto-calculated Q3 performance scores.</li>
                </ul>
            </Modal>
        </div>
    );
};

export default OrganizationDashboard;
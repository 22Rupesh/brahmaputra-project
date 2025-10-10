import React, { useState, useEffect } from 'react';
import ScoreGauge from '../ScoreGauge';
import PerformanceChart from '../PerformanceChart';
import KpiTable from '../KpiTable';
import ContributionGraph from '../ContributionGraph';
import { UserProfile, Task, DprTask, Project } from '../../types';
import Modal from '../Modal';

interface IndividualDashboardProps {
    userProfile: UserProfile;
    divisionAverage: number;
    isCurrentUser: boolean;
    onDashboardVisit: (userId: number) => void;
    dprTasks: DprTask[];
    allProjects: Project[];
}

const IndividualDashboard: React.FC<IndividualDashboardProps> = ({ userProfile, divisionAverage, isCurrentUser, onDashboardVisit, dprTasks, allProjects }) => {
  const [isSimulateModalOpen, setSimulateModalOpen] = useState(false);
  
  const hasQuantitativeKpis = userProfile.quantitativeKpis && userProfile.quantitativeKpis.length > 0;
  
  const [simulatedKpiValue, setSimulatedKpiValue] = useState(0);
  
  useEffect(() => {
    if (hasQuantitativeKpis) {
      setSimulatedKpiValue(parseInt(userProfile.quantitativeKpis[0].actual || '0', 10));
    }
  }, [userProfile.quantitativeKpis, hasQuantitativeKpis]);

  useEffect(() => {
    // Log a visit activity for the current day if it's the logged-in user's dashboard
    if (isCurrentUser) {
      // This function checks if an activity for today already exists before logging.
      onDashboardVisit(userProfile.id);
    }
    // We only want this to run once when the user's dashboard is mounted.
  }, [isCurrentUser, userProfile.id, onDashboardVisit]);

  const MyGoals = ({ tasks, kpis }: { tasks: Task[], kpis: UserProfile['quantitativeKpis'] }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 h-full">
      <h3 className="text-lg font-bold text-brand-dark mb-4">My Goals & Tasks</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Assigned Tasks</h4>
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {tasks.map(task => (
              <li key={task.id} className={`p-2 rounded-md text-sm ${task.status === 'Completed' ? 'bg-green-100' : task.status === 'Overdue' ? 'bg-red-100' : 'bg-gray-100'}`}>
                <p className="font-medium">{task.name} ({task.projectName})</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Due: {task.dueDate}</span>
                  <span className={`font-bold ${task.status === 'Overdue' ? 'text-red-600' : 'text-gray-600'}`}>{task.status}</span>
                </div>
              </li>
            ))}
             {tasks.length === 0 && <p className="text-sm text-gray-500">No tasks assigned.</p>}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Key Performance Indicators</h4>
          <ul className="text-sm space-y-1 text-gray-600">
            {kpis.map(kpi => (
              <li key={kpi.name}>{kpi.name}: {kpi.actual}/{kpi.target} (Weight: {kpi.weight})</li>
            ))}
             {kpis.length === 0 && <p className="text-sm text-gray-500">No KPIs assigned.</p>}
          </ul>
        </div>
      </div>
    </div>
  );

  const AiCoach = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 h-full">
      <h3 className="text-lg font-bold text-brand-dark mb-4">🤖 AI Coach / Assistant</h3>
      <div className="space-y-4 text-sm">
        <div className="bg-brand-accent-light p-3 rounded-md">
          <p className="font-semibold text-brand-accent">Smart Suggestion</p>
          <p className="text-gray-700">Your 'Report Submissions' are slightly behind target. Try batching tasks by setting aside 1 hour every Friday for writing.</p>
        </div>
        {hasQuantitativeKpis && (
            <button 
              onClick={() => setSimulateModalOpen(true)}
              className="w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-medium hover:bg-brand-dark transition-colors"
            >
              Simulate Score Improvement
            </button>
        )}
      </div>
    </div>
  );

  const Engagement = ({ badges, rank }: { badges: UserProfile['badges'], rank: number }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-lg font-bold text-brand-dark mb-4">Engagement & Rewards</h3>
      <div className="flex gap-4">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-700 mb-2">My Badges</h4>
          <div className="flex space-x-2">
            {badges.length > 0 ? badges.map(badge => (
              <div key={badge.name} title={badge.description} className="text-2xl cursor-pointer">{badge.icon}</div>
            )) : <p className="text-sm text-gray-500">No badges yet.</p>}
          </div>
        </div>
        <div className="text-center bg-gray-100 p-3 rounded-md">
          <h4 className="font-semibold text-gray-700">Team Rank</h4>
          <p className="text-3xl font-bold text-brand-accent">{rank}</p>
        </div>
      </div>
    </div>
  );

  const Learning = ({ feedback }: { feedback: UserProfile['feedback'] }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-lg font-bold text-brand-dark mb-4">Learning & Growth</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Suggested Training</h4>
          <p className="text-sm text-blue-600 hover:underline cursor-pointer">Office Note & Draft Writing Workshop</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Recent Feedback</h4>
          <div className="text-sm bg-gray-50 p-3 rounded-md max-h-24 overflow-y-auto">
            {feedback.length > 0 ? feedback.map((f, i) => (
              <p key={i} className="border-b last:border-b-0 py-1"><strong>{f.from}:</strong> {f.comment}</p>
            )) : <p className="text-gray-500">No feedback available.</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const calculateSimulatedScore = () => {
    if (!hasQuantitativeKpis) {
        return userProfile.score;
    }
    const kpiToSimulate = userProfile.quantitativeKpis[0];
    const otherKpisScore = userProfile.quantitativeKpis.slice(1).reduce((acc, kpi) => acc + parseFloat(kpi.weightedScore), 0);
    const target = parseInt(kpiToSimulate.target, 10);
    const weight = parseFloat(kpiToSimulate.weight);
    const simulatedWeightedScore = Math.min((simulatedKpiValue / target) * weight, weight);
    return Math.round(otherKpisScore + simulatedWeightedScore);
  };

  const today = new Date().toLocaleDateString('en-CA');
  const todaysTasks = dprTasks.filter(t => t.taskDate === today);
  const approvedToday = todaysTasks.filter(t => t.status === 'Approved').length;
  const dailyProgress = todaysTasks.length > 0 ? Math.round((approvedToday / todaysTasks.length) * 100) : 0;

  const userProjects = allProjects.filter(p => p.team.includes(userProfile.id));
  const mainProject = userProjects.length > 0 ? userProjects[0] : null;

  const getStatusChip = (status: DprTask['status']) => {
      const colors = {
          Pending: 'bg-gray-200 text-gray-800',
          Completed: 'bg-blue-200 text-blue-800',
          Approved: 'bg-green-200 text-green-800',
          Rejected: 'bg-red-200 text-red-800',
      };
      return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
       <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-brand-dark">My Dashboard: {userProfile.name}</h2>
        <div className="text-right">
          <p className="font-semibold">Your Score: <span className="text-brand-accent">{userProfile.score}</span></p>
          <p className="text-sm text-gray-500">Division Avg: {divisionAverage}</p>
        </div>
      </div>
      
      {/* NEW Daily Progress Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-bold text-brand-dark mb-4">Today's Snapshot ({today})</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                  <h4 className="font-semibold text-gray-700 mb-2">Daily Progress Report Tasks</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {todaysTasks.length > 0 ? todaysTasks.map(task => (
                          <div key={task.id} className="p-3 rounded-md bg-gray-50 flex justify-between items-center text-sm">
                              <p className="text-gray-800">{task.description}</p>
                              {getStatusChip(task.status)}
                          </div>
                      )) : (
                          <p className="text-sm text-gray-500">No tasks logged for today. Go to the DPR page to add tasks.</p>
                      )}
                  </div>
              </div>
              <div className="space-y-4">
                  <div>
                      <h4 className="font-semibold text-gray-700 mb-2 text-center">Daily Goal</h4>
                      <div className="relative w-24 h-24 mx-auto">
                          <svg className="w-full h-full" viewBox="0 0 36 36">
                              <path className="text-gray-200" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                              <path className="text-brand-accent" strokeWidth="3" fill="none" strokeDasharray={`${dailyProgress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xl font-bold text-brand-dark">{dailyProgress}%</span>
                          </div>
                      </div>
                      <p className="text-xs text-center text-gray-500 mt-1">Based on approved tasks</p>
                  </div>
                  {mainProject && (
                      <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Project Progress ({mainProject.name})</h4>
                          <div className="w-full bg-gray-200 rounded-full h-4">
                              <div className="bg-brand-accent h-4 rounded-full text-center text-white text-xs leading-4" style={{ width: `${mainProject.progress}%` }}>
                                  {mainProject.progress}%
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <ContributionGraph activityData={userProfile.activityLog || []} title="My Activity" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg border border-gray-200 flex flex-col items-center justify-center">
          <ScoreGauge score={userProfile.score} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MyGoals tasks={userProfile.tasks || []} kpis={userProfile.quantitativeKpis || []}/>
            <AiCoach />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Engagement badges={userProfile.badges || []} rank={3} />
        <Learning feedback={userProfile.feedback || []} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <PerformanceChart data={userProfile.performanceData || []} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <KpiTable 
            quantitativeKpis={userProfile.quantitativeKpis || []}
            qualitativeKpis={userProfile.qualitativeKpis || []}
        />
      </div>

      <Modal isOpen={isSimulateModalOpen} onClose={() => setSimulateModalOpen(false)} title="Score Simulation">
        {hasQuantitativeKpis ? (
            <div className="space-y-4">
              <p>Adjust your '{userProfile.quantitativeKpis[0]?.name}' progress to see the impact on your overall score.</p>
              <div>
                <label htmlFor="kpi-slider" className="block text-sm font-medium text-gray-700">Actual: {simulatedKpiValue} / {userProfile.quantitativeKpis[0]?.target}</label>
                <input 
                  type="range" 
                  id="kpi-slider"
                  min="0" 
                  max={userProfile.quantitativeKpis[0]?.target} 
                  value={simulatedKpiValue}
                  onChange={(e) => setSimulatedKpiValue(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="text-center bg-brand-accent-light p-4 rounded-md">
                <p className="font-semibold text-gray-700">New Potential Score</p>
                <p className="text-4xl font-bold text-brand-accent">{calculateSimulatedScore()}</p>
              </div>
            </div>
        ) : (
             <p className="text-gray-600">No quantitative KPIs available to simulate.</p>
        )}
      </Modal>

    </div>
  );
};

export default IndividualDashboard;
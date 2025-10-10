import React, { useState, useMemo } from 'react';
import { UserProfile, DprTask, Project } from '../../types';
import Modal from '../Modal';

interface DprPageProps {
  viewedUser: UserProfile;
  allUsers: UserProfile[];
  allProjects: Project[];
  allDprTasks: DprTask[];
  onCreateTask: (task: Omit<DprTask, 'id' | 'status'>) => Promise<void>;
  onUpdateTask: (taskId: number, status: DprTask['status'], mentorNotes?: string) => Promise<void>;
}

const DprPage: React.FC<DprPageProps> = ({ viewedUser, allUsers, allProjects, allDprTasks, onCreateTask, onUpdateTask }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  
  // For managers to view their team's DPRs
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string>('');
  
  // For adding a new task
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskProject, setNewTaskProject] = useState<string>('');

  // For rejecting a task
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingTask, setRejectingTask] = useState<DprTask | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');

  const isManager = viewedUser.title.includes('(Admin)') || viewedUser.title.includes('(Staff)');
  
  const teamMembers = useMemo(() => {
    if (!isManager) return [];
    // A manager can see everyone in their division except themselves
    return allUsers.filter(u => u.division === viewedUser.division && u.id !== viewedUser.id);
  }, [allUsers, viewedUser, isManager]);

  const userToView = useMemo(() => {
    if (!isManager) return viewedUser;
    return allUsers.find(u => u.id === parseInt(selectedTeamMemberId, 10)) || null;
  }, [isManager, viewedUser, allUsers, selectedTeamMemberId]);

  const userProjects = useMemo(() => {
    return allProjects.filter(p => p.team.includes(viewedUser.id));
  }, [allProjects, viewedUser]);

  const tasksForDate = useMemo(() => {
    if (!userToView) return [];
    return allDprTasks.filter(t => t.userId === userToView.id && t.taskDate === selectedDate);
  }, [allDprTasks, userToView, selectedDate]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDesc || !newTaskProject) {
        alert("Please provide a description and select a project.");
        return;
    }
    onCreateTask({
        userId: viewedUser.id,
        taskDate: selectedDate,
        description: newTaskDesc,
        projectId: parseInt(newTaskProject, 10),
    });
    setNewTaskDesc('');
    setNewTaskProject('');
  };

  const openRejectModal = (task: DprTask) => {
    setRejectingTask(task);
    setRejectModalOpen(true);
  };
  
  const handleRejectSubmit = () => {
    if (rejectingTask) {
        onUpdateTask(rejectingTask.id, 'Rejected', rejectionNotes);
        setRejectModalOpen(false);
        setRejectionNotes('');
        setRejectingTask(null);
    }
  };
  
  const getProjectName = (projectId: number) => allProjects.find(p => p.id === projectId)?.name || 'Unknown Project';

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
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-brand-dark">Daily Progress Report</h2>
        <div className="flex items-center gap-4">
            {isManager && (
                <select 
                    value={selectedTeamMemberId}
                    onChange={e => setSelectedTeamMemberId(e.target.value)}
                    className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent text-sm"
                >
                    <option value="">Select Team Member</option>
                    {teamMembers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            )}
            <input 
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent text-sm"
            />
        </div>
      </div>

      {!isManager && (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-brand-dark mb-4">Add New Task for {selectedDate}</h3>
            <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Task Description</label>
                    <textarea 
                        value={newTaskDesc}
                        onChange={e => setNewTaskDesc(e.target.value)}
                        required
                        rows={2}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-accent focus:border-brand-accent"
                        placeholder="e.g., Conducted site visit and prepared the report."
                    />
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700">Project</label>
                     <select
                        value={newTaskProject}
                        onChange={e => setNewTaskProject(e.target.value)}
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-accent focus:border-brand-accent"
                     >
                        <option value="">Select Project</option>
                        {userProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                </div>
                <div className="md:col-start-3">
                    <button type="submit" className="w-full bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">Add Task</button>
                </div>
            </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-brand-dark mb-4">
            {userToView ? `Tasks for ${userToView.name} on ${selectedDate}` : 'Select a team member to view their DPR'}
        </h3>
        <div className="space-y-3">
            {tasksForDate.length > 0 ? tasksForDate.map(task => (
                <div key={task.id} className="p-4 rounded-md border hover:bg-gray-50 transition-colors">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                            <p className="text-gray-800">{task.description}</p>
                            <p className="text-xs text-gray-500">Project: {getProjectName(task.projectId)}</p>
                            {task.status === 'Rejected' && task.mentorNotes && (
                                <p className="text-xs text-red-600 mt-1"><strong>Mentor Note:</strong> {task.mentorNotes}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {getStatusChip(task.status)}
                            {!isManager && task.status === 'Pending' && (
                                <button onClick={() => onUpdateTask(task.id, 'Completed')} className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-md">Mark as Complete</button>
                            )}
                             {isManager && task.status === 'Completed' && (
                                <>
                                    <button onClick={() => onUpdateTask(task.id, 'Approved')} className="text-sm bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded-md">Approve</button>
                                    <button onClick={() => openRejectModal(task)} className="text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-md">Reject</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )) : (
                <p className="text-center text-gray-500 py-4">{userToView ? 'No tasks found for this date.' : ''}</p>
            )}
        </div>
      </div>
      
      <Modal isOpen={isRejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Task">
        <p className="text-sm text-gray-600 mb-2">Please provide a reason for rejecting this task. The user will see these notes.</p>
        <textarea
            value={rejectionNotes}
            onChange={e => setRejectionNotes(e.target.value)}
            rows={4}
            className="w-full border p-2 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
            placeholder="e.g., Please provide more details or attach the report."
        />
        <div className="mt-4 flex justify-end gap-3">
            <button onClick={() => setRejectModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md text-sm">Cancel</button>
            <button onClick={handleRejectSubmit} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md text-sm">Confirm Rejection</button>
        </div>
      </Modal>

    </div>
  );
};

export default DprPage;

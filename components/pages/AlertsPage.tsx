import React, { useState } from 'react';
import { UserProfile } from '../../types';

interface AlertsPageProps {
    allUsers: UserProfile[];
    viewedUser: UserProfile;
    onSendAlert: (recipientEmail: string, subject: string, message: string) => Promise<void>;
}

const AlertsPage: React.FC<AlertsPageProps> = ({ allUsers, viewedUser, onSendAlert }) => {
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isAdmin = viewedUser.title.includes('(Admin)');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const recipient = allUsers.find(u => u.id === parseInt(selectedUserId, 10));
        if (!recipient || !recipient.email) {
            alert('Please select a valid user with an email address.');
            return;
        }

        setIsLoading(true);
        await onSendAlert(recipient.email, subject, message);
        setIsLoading(false);
        
        // Reset form
        setSelectedUserId('');
        setSubject('');
        setMessage('');
    };

    if (!isAdmin) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h2 className="text-xl font-bold text-brand-dark">Access Denied</h2>
                <p className="text-gray-600 mt-2">You do not have permission to access this page. Please contact an administrator.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-dark">Send User Alert</h2>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="user-select" className="block text-sm font-medium text-gray-700">Recipient</label>
                        <select
                            id="user-select"
                            value={selectedUserId}
                            onChange={e => setSelectedUserId(e.target.value)}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm rounded-md"
                        >
                            <option value="" disabled>Select a user to alert...</option>
                            {allUsers.filter(u => u.id !== viewedUser.id).map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email || 'No email'})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                        <input
                            type="text"
                            id="subject"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                            placeholder="e.g., Regarding your Q3 Performance"
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                        <textarea
                            id="message"
                            rows={6}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                            placeholder="Compose the alert message to be sent to the user's email..."
                        ></textarea>
                    </div>
                    <div className="text-right">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm disabled:bg-gray-400"
                        >
                            {isLoading ? 'Sending...' : 'Send Alert'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AlertsPage;

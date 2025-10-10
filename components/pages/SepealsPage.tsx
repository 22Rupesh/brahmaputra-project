
import React from 'react';

// Define a type for our random data
interface Sepeal {
  id: number;
  subject: string;
  status: 'Approved' | 'Rejected' | 'Pending';
  date: string;
  handler: string;
}

// Function to generate random data
const generateRandomSepeals = (count: number): Sepeal[] => {
  const sepeals: Sepeal[] = [];
  const subjects = [
    'Budget Revision Request Q4',
    'Extra Manpower Allocation',
    'IT Infrastructure Upgrade Proposal',
    'Vehicle Maintenance Approval',
    'Inter-departmental Transfer',
    'New Software Procurement',
    'Office Renovation Plan',
  ];
  const handlers = ['Mr. Sharma', 'Ms. Gupta', 'Mr. Verma', 'Ms. Reddy', 'Mr. Patel'];
  const statuses: Sepeal['status'][] = ['Approved', 'Rejected', 'Pending'];

  for (let i = 1; i <= count; i++) {
    const randomDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
    sepeals.push({
      id: 1000 + i,
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      date: randomDate.toLocaleDateString('en-CA'),
      handler: handlers[Math.floor(Math.random() * handlers.length)],
    });
  }
  return sepeals;
};

const getStatusColor = (status: Sepeal['status']) => {
    switch (status) {
        case 'Pending': return 'bg-yellow-200 text-yellow-800';
        case 'Approved': return 'bg-green-200 text-green-800';
        case 'Rejected': return 'bg-red-200 text-red-800';
        default: return 'bg-gray-200 text-gray-800';
    }
};


const SepealsPage: React.FC = () => {
  const randomData = generateRandomSepeals(10); // Generate 10 random items

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brand-dark">Sepeals Management</h2>
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-brand-dark mb-4">Random Sepeal Data</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Sepeal ID</th>
                <th scope="col" className="px-6 py-3">Subject</th>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Handler</th>
              </tr>
            </thead>
            <tbody>
              {randomData.map((sepeal) => (
                <tr key={sepeal.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{sepeal.id}</td>
                  <td className="px-6 py-4">{sepeal.subject}</td>
                  <td className="px-6 py-4">{sepeal.date}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(sepeal.status)}`}>
                        {sepeal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{sepeal.handler}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SepealsPage;

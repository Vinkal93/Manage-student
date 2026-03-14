const ASSIGNMENTS_KEY = 'insuite_assignments';

export interface Assignment {
  id: string;
  title: string;
  className: string;
  subject: string;
  description: string;
  deadline: string;
  createdAt: string;
  submissions: Submission[];
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  comment: string;
  marks?: number;
  feedback?: string;
}

export function getAssignments(): Assignment[] {
  const data = localStorage.getItem(ASSIGNMENTS_KEY);
  if (data) return JSON.parse(data);
  const sample = getSampleAssignments();
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(sample));
  return sample;
}

export function saveAssignments(assignments: Assignment[]) {
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

export function addAssignment(data: Omit<Assignment, 'id' | 'createdAt' | 'submissions'>): Assignment {
  const assignments = getAssignments();
  const newAssignment: Assignment = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString().split('T')[0],
    submissions: [],
  };
  assignments.push(newAssignment);
  saveAssignments(assignments);
  return newAssignment;
}

export function submitAssignment(assignmentId: string, submission: Omit<Submission, 'id' | 'submittedAt'>): void {
  const assignments = getAssignments();
  const assignment = assignments.find(a => a.id === assignmentId);
  if (!assignment) return;
  assignment.submissions.push({
    ...submission,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString().split('T')[0],
  });
  saveAssignments(assignments);
}

export function gradeSubmission(assignmentId: string, submissionId: string, marks: number, feedback: string): void {
  const assignments = getAssignments();
  const assignment = assignments.find(a => a.id === assignmentId);
  if (!assignment) return;
  const submission = assignment.submissions.find(s => s.id === submissionId);
  if (!submission) return;
  submission.marks = marks;
  submission.feedback = feedback;
  saveAssignments(assignments);
}

export function deleteAssignment(id: string) {
  const assignments = getAssignments().filter(a => a.id !== id);
  saveAssignments(assignments);
}

function getSampleAssignments(): Assignment[] {
  return [
    {
      id: crypto.randomUUID(),
      title: 'Excel Project - Student Database',
      className: 'ADCA Batch A',
      subject: 'Excel',
      description: 'Create a student database in Excel with formulas for total marks, percentage, and grade calculation.',
      deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      submissions: [
        { id: crypto.randomUUID(), studentId: 'SBCI0001', studentName: 'Rahul Sharma', submittedAt: new Date().toISOString().split('T')[0], comment: 'Completed', marks: 85, feedback: 'Good work!' },
      ],
    },
    {
      id: crypto.randomUUID(),
      title: 'Typing Speed Test',
      className: 'CCC Batch',
      subject: 'Typing',
      description: 'Complete a 10-minute typing test with minimum 30 WPM accuracy.',
      deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      submissions: [],
    },
  ];
}

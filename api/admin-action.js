import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { action, student_name, score, password } = req.body;

    // Password Verification
    const ADMIN_PASSWORD = '113003';
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized. Incorrect password.' });
    }

    // Basic validation
    if (!action || !['edit', 'delete'].includes(action)) {
      return res.status(400).json({ error: 'Bad Request. Invalid action.' });
    }
    if (!student_name) {
      return res.status(400).json({ error: 'Bad Request. student_name is required.' });
    }

    if (action === 'delete') {
      // Remove the student from the sorted set
      await redis.zrem('leaderboard', student_name);
      return res.status(200).json({ success: true, message: 'Record deleted successfully.' });
    } 
    
    if (action === 'edit') {
      if (typeof score !== 'number') {
        return res.status(400).json({ error: 'Bad Request. Score must be a number for editing.' });
      }
      // Add or update the student's score
      await redis.zadd('leaderboard', { score, member: student_name });
      return res.status(200).json({ success: true, message: 'Record updated successfully.' });
    }

  } catch (error) {
    console.error('Error processing admin action:', error);
    return res.status(500).json({ error: error.message });
  }
}

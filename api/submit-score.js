import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { student_name, score } = req.body;

    // Basic validation
    if (!student_name || typeof score !== 'number') {
      return res.status(400).json({ error: 'Bad Request. Expected student_name (string) and score (number).' });
    }

    // Add or update the student's score in the 'leaderboard' sorted set.
    await redis.zadd('leaderboard', { score, member: student_name });

    return res.status(200).json({ success: true, message: 'Score submitted successfully.' });
  } catch (error) {
    console.error('Error submitting score to KV:', error);
    return res.status(500).json({ error: error.message });
  }
}

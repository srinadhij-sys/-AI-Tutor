import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed. Use GET.' });
  }

  try {
    // Fetch the top 100 students from the 'leaderboard' sorted set.
    // zrange(key, start, stop, options)
    // rev: true means highest scores first
    // withScores: true means we get { member, score } objects back
    const leaderboard = await kv.zrange('leaderboard', 0, 99, { rev: true, withScores: true });

    // Format the response nicely for the frontend
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      student_name: entry.member,
      score: entry.score,
    }));

    return res.status(200).json({ success: true, leaderboard: formattedLeaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard from KV:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

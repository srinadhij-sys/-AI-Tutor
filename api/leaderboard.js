import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed. Use GET.' });
  }

  try {
    const leaderboard = await redis.zrange("leaderboard", 0, 99, {
      rev: true,
      withScores: true,
    });

    // Upstash Redis returns data in an alternating flat array like: ["member1", 100, "member2", 50]
    // OR it returns [{member: "name", score: 100}] depending on the exact implementation.
    // The safest way is to ensure we map it to what the frontend expects.
    let formattedLeaderboard = [];
    
    if (Array.isArray(leaderboard)) {
        if (leaderboard.length > 0 && typeof leaderboard[0] === 'object' && leaderboard[0] !== null) {
            // It returned an array of objects
            formattedLeaderboard = leaderboard.map((entry, index) => ({
                rank: index + 1,
                student_name: entry.member,
                score: entry.score,
            }));
        } else {
            // It returned a flat array
            for (let i = 0; i < leaderboard.length; i += 2) {
                formattedLeaderboard.push({
                    rank: (i / 2) + 1,
                    student_name: leaderboard[i],
                    score: leaderboard[i + 1]
                });
            }
        }
    }

    res.status(200).json({ success: true, leaderboard: formattedLeaderboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

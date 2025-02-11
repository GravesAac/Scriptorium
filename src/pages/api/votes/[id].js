// AI Disclosure: This file may partially contain code generated by models such as GitHub Copiolot or ChatGPT
import prisma from '../../../utils/db';
import { authMiddleware } from '../../../utils/middleware';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { user } = req;
  const { type } = req.query; // 'post' or 'comment'

  if (!type || (type !== 'post' && type !== 'comment')) {
    return res.status(400).json({ error: "Type must be specified as 'post' or 'comment'" });
  }

  try {
    let vote;
    if (type === 'post') {
      // Check if the user has voted on this blog post
      vote = await prisma.vote.findUnique({
        where: { userId_blogPostId: { userId: user.userId, blogPostId: parseInt(id) } },
        select: { type: true }, 
      });
    } else if (type === 'comment') {
      // Check if the user has voted on this blog comment
      vote = await prisma.vote.findUnique({
        where: { userId_commentId: { userId: user.userId, commentId: parseInt(id) } },
        select: { type: true }, 
      });
    }

    // If no vote is found, respond with null
    if (!vote) {
      return res.status(200).json({ hasVoted: false, voteType: null });
    }

    // Respond with the vote type if a vote was found
    return res.status(200).json({ hasVoted: true, voteType: vote.type });
  } catch (error) {
    console.error('Error retrieving vote:', error);
    return res.status(500).json({ error: 'Failed to retrieve vote' });
  }
}

export default authMiddleware(handler);

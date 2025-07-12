import { db } from '../server/db'
import { questions } from '../shared/schema'

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'GET') {
    try {
      const teacherQuestions = await db.select().from(questions)
      
      res.status(200).json(teacherQuestions)
    } catch (error) {
      console.error('Error fetching questions:', error)
      res.status(500).json({ error: 'Failed to fetch questions' })
    }
  } else if (req.method === 'POST') {
    try {
      const { text, type, options, correctAnswer } = req.body
      
      if (!text || !type) {
        return res.status(400).json({ error: 'Text and type are required' })
      }
      
      const newQuestion = await db.insert(questions).values({
        text,
        type,
        options: options || [],
        correctAnswer: correctAnswer || null,
        teacherId: '1', // TODO: Get from auth
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning()
      
      res.status(201).json(newQuestion[0])
    } catch (error) {
      console.error('Error creating question:', error)
      res.status(500).json({ error: 'Failed to create question' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 
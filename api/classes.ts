import { db } from '../server/db'
import { classes } from '../shared/schema'

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
      // Get classes for the authenticated user
      const userClasses = await db.select().from(classes)
      
      res.status(200).json(userClasses)
    } catch (error) {
      console.error('Error fetching classes:', error)
      res.status(500).json({ error: 'Failed to fetch classes' })
    }
  } else if (req.method === 'POST') {
    try {
      const { name, grade } = req.body
      
      if (!name || !grade) {
        return res.status(400).json({ error: 'Name and grade are required' })
      }
      
      const newClass = await db.insert(classes).values({
        name,
        grade,
        teacherId: '1', // TODO: Get from auth
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning()
      
      res.status(201).json(newClass[0])
    } catch (error) {
      console.error('Error creating class:', error)
      res.status(500).json({ error: 'Failed to create class' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 
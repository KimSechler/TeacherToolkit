import { db } from '../server/db'
import { students } from '../shared/schema'
import { eq } from 'drizzle-orm'

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
      const { classId } = req.query
      
      if (!classId) {
        return res.status(400).json({ error: 'Class ID is required' })
      }
      
      const classStudents = await db.select().from(students).where(eq(students.classId, parseInt(classId)))
      
      res.status(200).json(classStudents)
    } catch (error) {
      console.error('Error fetching students:', error)
      res.status(500).json({ error: 'Failed to fetch students' })
    }
  } else if (req.method === 'POST') {
    try {
      const { name, classId } = req.body
      
      if (!name || !classId) {
        return res.status(400).json({ error: 'Name and classId are required' })
      }
      
      const newStudent = await db.insert(students).values({
        name,
        classId: parseInt(classId),
        createdAt: new Date()
      }).returning()
      
      res.status(201).json(newStudent[0])
    } catch (error) {
      console.error('Error creating student:', error)
      res.status(500).json({ error: 'Failed to create student' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 
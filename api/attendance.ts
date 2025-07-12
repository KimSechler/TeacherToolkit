import { db } from '../server/db'
import { attendanceRecords } from '../shared/schema'
import { eq, and } from 'drizzle-orm'

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
      const { classId, date } = req.query
      
      if (!classId || !date) {
        return res.status(400).json({ error: 'Class ID and date are required' })
      }
      
      const records = await db.select().from(attendanceRecords)
        .where(and(
          eq(attendanceRecords.classId, parseInt(classId)),
          eq(attendanceRecords.date, new Date(date))
        ))
      
      res.status(200).json(records)
    } catch (error) {
      console.error('Error fetching attendance:', error)
      res.status(500).json({ error: 'Failed to fetch attendance' })
    }
  } else if (req.method === 'POST') {
    try {
      const { classId, date, records } = req.body
      
      if (!classId || !date || !records) {
        return res.status(400).json({ error: 'Class ID, date, and records are required' })
      }
      
      // Insert attendance records
      const attendanceData = records.map((record: any) => ({
        classId: parseInt(classId),
        studentId: parseInt(record.studentId),
        date: new Date(date),
        isPresent: record.isPresent,
        questionResponse: record.questionResponse || null,
        createdAt: new Date()
      }))
      
      const newRecords = await db.insert(attendanceRecords).values(attendanceData).returning()
      
      res.status(201).json(newRecords)
    } catch (error) {
      console.error('Error creating attendance:', error)
      res.status(500).json({ error: 'Failed to create attendance' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 
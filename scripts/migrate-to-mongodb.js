const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edu-management'

console.log('Connecting to MongoDB:', MONGODB_URI)

// Define schemas directly in migration script
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Agency'], required: true },
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' },
  agencyName: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  lastLogin: { type: Date }
}, { timestamps: true })

const AgencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  contactPerson: { type: String, required: true },
  commissionRate: { type: Number, required: true, min: 0, max: 100 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String }
}, { timestamps: true })

const CollegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  ranking: { type: Number, required: true },
  description: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  facilities: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  establishedYear: { type: Number, required: true }
}, { timestamps: true })

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, required: true },
  duration: { type: String, required: true },
  fee: { type: Number, required: true },
  currency: { type: String, required: true },
  requirements: { type: String, required: true },
  sessions: [{ type: String }],
  courseType: { type: String },
  streams: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
}, { timestamps: true })

const ApplicationSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
  agencyName: { type: String, required: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  collegeName: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  courseName: { type: String, required: true },
  courseType: { type: String },
  stream: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'processing'], default: 'pending' },
  fees: { type: Number, required: true },
  documents: [{ type: String }],
  pendingDocuments: [{ type: String }],
  abcId: { type: String },
  debId: { type: String },
  applicationId: { type: String, unique: true, index: true },
  academicRecords: [{
    level: { type: String },
    board: { type: String },
    year: { type: String },
    obtainedMarks: { type: String },
    percentage: { type: String },
    marksheetUrl: { type: String }
  }],
  studentDetails: {
    dateOfBirth: { type: String },
    nationality: { type: String },
    address: { type: String },
    personalStatement: { type: String },
    workExperience: { type: String },
    previousEducation: { type: String },
    gpa: { type: String },
    englishProficiency: { type: String }
  },
  pdfGenerated: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true })

const PaymentSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  studentName: { type: String, required: true },
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
  agencyName: { type: String, required: true },
  amount: { type: Number, required: true },
  commission: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paymentDate: { type: Date },
  dueDate: { type: Date, required: true }
}, { timestamps: true })

// Create models
const User = mongoose.model('User', UserSchema)
const Agency = mongoose.model('Agency', AgencySchema)
const College = mongoose.model('College', CollegeSchema)
const Course = mongoose.model('Course', CourseSchema)
const Application = mongoose.model('Application', ApplicationSchema)
const Payment = mongoose.model('Payment', PaymentSchema)

async function migrateData() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Drop database to start fresh
    await mongoose.connection.db.dropDatabase()
    console.log('Dropped existing database')

    // Read JSON files
    const agenciesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/agencies.json'), 'utf8'))
    const applicationsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/applications.json'), 'utf8'))
    const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf8'))

    // Sample colleges data
    const collegesData = [
      {
        name: "Massachusetts Institute of Technology",
        location: "Cambridge, Massachusetts, USA",
        type: "Private",
        ranking: 1,
        description: "World-renowned institute for technology and innovation",
        email: "admissions@mit.edu",
        phone: "+1 617 253 1000",
        facilities: ["Research Labs", "Library", "Student Housing", "Sports Complex"],
        status: "active",
        establishedYear: 1861
      },
      {
        name: "Stanford University",
        location: "Stanford, California, USA",
        type: "Private",
        ranking: 2,
        description: "Leading research university in Silicon Valley",
        email: "admission@stanford.edu",
        phone: "+1 650 723 2300",
        facilities: ["Research Centers", "Libraries", "Dormitories", "Athletic Facilities"],
        status: "active",
        establishedYear: 1885
      },
      {
        name: "University of Oxford",
        location: "Oxford, England, UK",
        type: "Public",
        ranking: 3,
        description: "One of the oldest universities in the world",
        email: "admissions@ox.ac.uk",
        phone: "+44 1865 270000",
        facilities: ["Historic Libraries", "Colleges", "Research Institutes"],
        status: "active",
        establishedYear: 1096
      }
    ]

    const coursesData = [
      {
        name: "Computer Science and Engineering",
        level: "Bachelor's",
        duration: "4 years",
        fee: 75000,
        currency: "USD",
        requirements: "High school diploma with strong math background",
        sessions: ["Fall 2024", "Spring 2025"],
        courseType: "Engineering",
        streams: ["Computer Science", "Software Engineering"],
        status: "active"
      },
      {
        name: "Master of Business Administration",
        level: "Master's",
        duration: "2 years",
        fee: 85000,
        currency: "USD",
        requirements: "Bachelor's degree with minimum 3.0 GPA",
        sessions: ["Fall 2024", "Spring 2025"],
        courseType: "Business",
        streams: ["Finance", "Marketing"],
        status: "active"
      }
    ]

    // Migrate Users
    console.log('Migrating users...')
    const userMap = new Map()
    for (const userData of usersData) {
      // Set correct passwords for demo accounts
      let password = 'password123' // default
      if (userData.email === 'admin@grindx.io') {
        password = 'admin123'
      } else if (userData.email === 'agency@grindx.io') {
        password = 'agency123'
      }
      
      const hashedPassword = await bcrypt.hash(password, 10)
      try {
        const user = new User({
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
          agencyName: userData.agencyName,
          status: userData.status || 'active'
        })
        const savedUser = await user.save()
        userMap.set(userData.id, savedUser._id)
        console.log(`Created user: ${userData.username}`)
      } catch (error) {
        console.log(`Skipped duplicate user: ${userData.username}`)
      }
    }

    // Migrate Agencies
    console.log('Migrating agencies...')
    const agencyMap = new Map()
    for (const agencyData of agenciesData) {
      const agency = new Agency({
        name: agencyData.name,
        email: agencyData.email,
        phone: agencyData.phone,
        address: agencyData.address,
        contactPerson: agencyData.contactPerson,
        commissionRate: agencyData.commissionRate,
        status: agencyData.status,
        userId: agencyData.userId ? userMap.get(agencyData.userId) : null,
        username: agencyData.username
      })
      const savedAgency = await agency.save()
      agencyMap.set(agencyData.id, savedAgency._id)
      console.log(`Created agency: ${agencyData.name}`)
    }

    // Migrate Colleges
    console.log('Migrating colleges...')
    const collegeMap = new Map()
    for (let i = 0; i < collegesData.length; i++) {
      const collegeData = collegesData[i]
      const college = new College(collegeData)
      const savedCollege = await college.save()
      collegeMap.set((i + 1).toString(), savedCollege._id)
      console.log(`Created college: ${collegeData.name}`)
    }

    // Migrate Courses
    console.log('Migrating courses...')
    const courseMap = new Map()
    for (let i = 0; i < coursesData.length; i++) {
      const courseData = coursesData[i]
      const course = new Course({
        ...courseData,
        collegeId: collegeMap.get((i + 1).toString())
      })
      const savedCourse = await course.save()
      courseMap.set((i + 1).toString(), savedCourse._id)
      console.log(`Created course: ${courseData.name}`)
    }

    // Migrate Applications
    console.log('Migrating applications...')
    for (const appData of applicationsData) {
      if (agencyMap.has(appData.agencyId) && collegeMap.has(appData.collegeId)) {
        const application = new Application({
          studentName: appData.studentName,
          email: appData.email,
          phone: appData.phone,
          agencyId: agencyMap.get(appData.agencyId),
          agencyName: appData.agencyName,
          collegeId: collegeMap.get(appData.collegeId),
          collegeName: appData.collegeName,
          courseId: courseMap.get(appData.courseId) || courseMap.get('1'),
          courseName: appData.courseName,
          status: appData.status,
          fees: appData.fees,
          documents: appData.documents || [],
          pendingDocuments: appData.pendingDocuments || [],
          applicationId: appData.applicationId,
          academicRecords: appData.academicRecords || [],
          studentDetails: appData.studentDetails || {},
          pdfGenerated: appData.pdfGenerated || false
        })
        await application.save()
        console.log(`Created application: ${appData.studentName}`)
      }
    }

    console.log('Migration completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await mongoose.disconnect()
  }
}

migrateData()
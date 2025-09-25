import connectDB from './mongodb'
import User from './models/User'
import Agency from './models/Agency'
import College from './models/College'
import Course from './models/Course'
import Application from './models/Application'
import Payment from './models/Payment'
import bcrypt from 'bcryptjs'

export class DatabaseService {
  constructor() {
    this.initializeConnection()
  }

  private async initializeConnection() {
    try {
      await connectDB()
      console.log('MongoDB connected successfully')
    } catch (error) {
      console.error('MongoDB connection error:', error)
    }
  }

  // User operations
  async getUsers() {
    await connectDB()
    return await User.find().populate('agencyId')
  }

  async getUserById(id: string) {
    await connectDB()
    return await User.findById(id).populate('agencyId')
  }

  async getUserByUsername(username: string) {
    await connectDB()
    return await User.findOne({ username }).populate('agencyId')
  }

  async getUserByEmail(email: string) {
    await connectDB()
    return await User.findOne({ email }).populate('agencyId')
  }

  async createUser(userData: any) {
    await connectDB()
    
    // Hash password
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10)
    }

    const user = new User(userData)
    return await user.save()
  }

  async updateUser(id: string, updates: any) {
    await connectDB()
    
    try {
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10)
      }

      return await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).populate('agencyId')
    } catch (error) {
      console.error('Database error updating user:', error)
      throw error
    }
  }

  async deleteUser(id: string) {
    await connectDB()
    
    // Get user first to check for associated agency
    const user = await User.findById(id)
    if (!user) return null
    
    // If user has associated agency, delete it first
    if (user.agencyId) {
      await Agency.findByIdAndDelete(user.agencyId)
    }
    
    return await User.findByIdAndDelete(id)
  }

  // Agency operations
  async getAgencies() {
    await connectDB()
    return await Agency.find().populate('userId')
  }

  async getAgencyById(id: string) {
    await connectDB()
    return await Agency.findById(id).populate('userId')
  }

  async createAgency(agencyData: any) {
    await connectDB()
    const agency = new Agency(agencyData)
    return await agency.save()
  }

  async updateAgency(id: string, updates: any) {
    await connectDB()
    
    try {
      return await Agency.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).populate('userId')
    } catch (error) {
      console.error('Database error updating agency:', error)
      throw error
    }
  }

  async deleteAgency(id: string) {
    await connectDB()
    
    // Get agency first to check for associated user
    const agency = await Agency.findById(id)
    if (!agency) return null
    
    // If agency has associated user, delete it first
    if (agency.userId) {
      await User.findByIdAndDelete(agency.userId)
    }
    
    return await Agency.findByIdAndDelete(id)
  }

  // College operations
  async getColleges() {
    await connectDB()
    return await College.find()
  }

  async getCollegeById(id: string) {
    await connectDB()
    return await College.findById(id)
  }

  async createCollege(collegeData: any) {
    await connectDB()
    const college = new College(collegeData)
    return await college.save()
  }

  async updateCollege(id: string, updates: any) {
    await connectDB()
    return await College.findByIdAndUpdate(id, updates, { new: true })
  }

  async deleteCollege(id: string) {
    await connectDB()
    return await College.findByIdAndDelete(id)
  }

  // Course operations
  async getCourses() {
    await connectDB()
    return await Course.find().populate('collegeId')
  }

  async getCourseById(id: string) {
    await connectDB()
    return await Course.findById(id).populate('collegeId')
  }

  async getCoursesByCollegeId(collegeId: string) {
    await connectDB()
    return await Course.find({ collegeId })
  }

  async createCourse(courseData: any) {
    await connectDB()
    const course = new Course(courseData)
    return await course.save()
  }

  async updateCourse(id: string, updates: any) {
    await connectDB()
    return await Course.findByIdAndUpdate(id, updates, { new: true }).populate('collegeId')
  }

  async deleteCourse(id: string) {
    await connectDB()
    return await Course.findByIdAndDelete(id)
  }

  // Application operations
  async getApplications() {
    await connectDB()
    return await Application.find()
      .populate('agencyId')
      .populate('collegeId')
      .populate('courseId')
  }

  async getApplicationById(id: string) {
    await connectDB()
    return await Application.findById(id)
      .populate('agencyId')
      .populate('collegeId')
      .populate('courseId')
  }

  async getApplicationsByAgencyId(agencyId: string) {
    await connectDB()
    return await Application.find({ agencyId })
      .populate('agencyId')
      .populate('collegeId')
      .populate('courseId')
  }

  async createApplication(applicationData: any) {
    await connectDB()
    const application = new Application(applicationData)
    return await application.save()
  }

  async updateApplication(id: string, updates: any) {
    await connectDB()
    return await Application.findByIdAndUpdate(id, updates, { new: true })
      .populate('agencyId')
      .populate('collegeId')
      .populate('courseId')
  }

  async deleteApplication(id: string) {
    await connectDB()
    return await Application.findByIdAndDelete(id)
  }

  // Payment operations
  async getPayments() {
    await connectDB()
    return await Payment.find()
      .populate('applicationId')
      .populate('agencyId')
  }

  async getPaymentById(id: string) {
    await connectDB()
    return await Payment.findById(id)
      .populate('applicationId')
      .populate('agencyId')
  }

  async getPaymentsByAgencyId(agencyId: string) {
    await connectDB()
    return await Payment.find({ agencyId })
      .populate('applicationId')
      .populate('agencyId')
  }

  async createPayment(paymentData: any) {
    await connectDB()
    const payment = new Payment(paymentData)
    return await payment.save()
  }

  async updatePayment(id: string, updates: any) {
    await connectDB()
    return await Payment.findByIdAndUpdate(id, updates, { new: true })
      .populate('applicationId')
      .populate('agencyId')
  }

  async deletePayment(id: string) {
    await connectDB()
    return await Payment.findByIdAndDelete(id)
  }

  // Analytics
  async getStats() {
    await connectDB()
    
    const [
      totalAgencies,
      activeAgencies,
      totalColleges,
      activeColleges,
      totalApplications,
      pendingApplications,
      approvedApplications,
      totalPayments,
      pendingPayments
    ] = await Promise.all([
      Agency.countDocuments(),
      Agency.countDocuments({ status: 'active' }),
      College.countDocuments(),
      College.countDocuments({ status: 'active' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'pending' }),
      Application.countDocuments({ status: 'approved' }),
      Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.countDocuments({ status: 'pending' })
    ])

    const totalCommissions = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$commission' } } }
    ])

    return {
      totalAgencies,
      activeAgencies,
      totalColleges,
      activeColleges,
      totalApplications,
      pendingApplications,
      approvedApplications,
      totalPayments: totalPayments[0]?.total || 0,
      pendingPayments,
      totalCommissions: totalCommissions[0]?.total || 0
    }
  }
}

export const db = new DatabaseService()
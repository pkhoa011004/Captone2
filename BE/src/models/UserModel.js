// User Model - Mock Data (Replace with actual database implementation)
// For demo purposes, using in-memory storage

let users = [
  {
    id: 1,
    email: 'admin@example.com',
    name: 'Admin User',
    phone: '0123456789',
    role: 'admin',
    passwordHash: '$2a$10$example_hash', // bcrypt hash of 'admin123'
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

let userIdCounter = 2

export class UserModel {
  static async findAll(filters = {}) {
    let result = users

    if (filters.search) {
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          u.email.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.role) {
      result = result.filter((u) => u.role === filters.role)
    }

    return result.map((u) => this.excludePassword(u))
  }

  static async findById(id) {
    const user = users.find((u) => u.id === parseInt(id))
    return user ? this.excludePassword(user) : null
  }

  static async findByEmail(email) {
    return users.find((u) => u.email === email)
  }

  static async create(data) {
    const user = {
      id: userIdCounter++,
      ...data,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    users.push(user)
    return this.excludePassword(user)
  }

  static async update(id, data) {
    const index = users.findIndex((u) => u.id === parseInt(id))
    if (index === -1) return null

    users[index] = {
      ...users[index],
      ...data,
      updatedAt: new Date(),
    }
    return this.excludePassword(users[index])
  }

  static async delete(id) {
    const index = users.findIndex((u) => u.id === parseInt(id))
    if (index === -1) return false

    users.splice(index, 1)
    return true
  }

  static excludePassword(user) {
    const { passwordHash, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}

export default UserModel

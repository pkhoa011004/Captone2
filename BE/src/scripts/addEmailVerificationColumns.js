import dotenv from 'dotenv'
import { ensureUsersEmailVerificationSchema } from '../config/migrations.js'

dotenv.config()

async function addEmailVerificationColumns() {
  const updated = await ensureUsersEmailVerificationSchema()
  process.exit(updated ? 0 : 1)
}

addEmailVerificationColumns()

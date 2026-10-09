import * as auth from '../services/authService.js'
import { loginSchema } from '../validators/schemas.js'

export const login = async (req, res) => {
  const { email, password } = loginSchema.parse(req.body)
  res.json({ success: true, data: await auth.login(email, password) })
}

export const me = (req, res) => res.json({ success: true, data: req.user })

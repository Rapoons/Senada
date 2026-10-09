import * as pub from '../services/publicService.js'
import { portfolioQuerySchema, slugSchema } from '../validators/schemas.js'

// Controller: validasi input, panggil service, bungkus respons { success, data }.
const ok = (res, data) => res.json({ success: true, data })

export const packages = async (req, res) => ok(res, await pub.listPackages())
export const categories = async (req, res) => ok(res, await pub.listCategories())
export const portfolios = async (req, res) => ok(res, await pub.listPortfolios(portfolioQuerySchema.parse(req.query)))
export const portfolioDetail = async (req, res) => ok(res, await pub.getPortfolio(slugSchema.parse(req.params.slug)))

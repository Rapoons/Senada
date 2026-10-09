import * as paket from '../services/adminPackageService.js'
import * as porto from '../services/adminPortfolioService.js'
import * as user from '../services/adminUserService.js'
import * as proyek from '../services/adminProjectService.js'
import * as v from '../validators/adminSchemas.js'

// Controller admin: validasi input (Zod), panggil service, bungkus respons { success, data }.
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data })
const id = (req, nama = 'id') => v.idParam.parse(req.params[nama])

export const ringkasan = async (req, res) => ok(res, await proyek.summary())

// Paket dan kategori
export const daftarPaket = async (req, res) => ok(res, await paket.listPackages())
export const ubahPaket = async (req, res) => ok(res, await paket.updatePackage(id(req), v.packageUpdate.parse(req.body)))
export const buatKategori = async (req, res) => ok(res, await paket.createCategory(v.categoryBody.parse(req.body)), 201)
export const ubahKategori = async (req, res) => ok(res, await paket.updateCategory(id(req), v.categoryBody.parse(req.body)))
export const hapusKategori = async (req, res) => { await paket.deleteCategory(id(req)); ok(res, null) }

// Portofolio dan galeri
export const daftarPortofolio = async (req, res) => ok(res, await porto.list())
export const detailPortofolio = async (req, res) => ok(res, await porto.get(id(req)))
export const buatPortofolio = async (req, res) => ok(res, await porto.create(v.portfolioBody.parse(req.body)), 201)
export const ubahPortofolio = async (req, res) => ok(res, await porto.update(id(req), v.portfolioUpdate.parse(req.body)))
export const hapusPortofolio = async (req, res) => { await porto.remove(id(req)); ok(res, null) }
export const tambahGambar = async (req, res) => ok(res, await porto.addImages(id(req), req.files), 201)
export const ubahGambar = async (req, res) => ok(res, await porto.updateImage(id(req), v.imageUpdate.parse(req.body)))
export const hapusGambar = async (req, res) => ok(res, await porto.removeImage(id(req)))

// Akun
export const daftarAkun = async (req, res) => ok(res, await user.list())
export const buatAkun = async (req, res) => ok(res, await user.create(v.userCreate.parse(req.body)), 201)
export const ubahAkun = async (req, res) => ok(res, await user.update(id(req), v.userUpdate.parse(req.body), req.user.id))

// Proyek
export const daftarProyek = async (req, res) => ok(res, await proyek.list())
export const buatProyek = async (req, res) => ok(res, await proyek.create(v.projectCreate.parse(req.body)), 201)

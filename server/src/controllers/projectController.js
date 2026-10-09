import * as proyek from '../services/projectService.js'
import * as berkas from '../services/fileService.js'
import * as komentar from '../services/commentService.js'
import * as notif from '../services/notificationService.js'
import * as v from '../validators/projectSchemas.js'
import { idParam } from '../validators/adminSchemas.js'

// Controller modul proyek. Hak akses per proyek dicek di service/middleware (projectAccess.js);
// di sini hanya validasi input dan pembungkus respons { success, data }.
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data })
const id = (req, nama = 'id') => idParam.parse(req.params[nama])

export const daftar = async (req, res) => ok(res, await proyek.list(req.user))
export const rincian = async (req, res) => ok(res, await proyek.detail(req.user, id(req)))
export const ubah = async (req, res) => ok(res, await proyek.update(id(req), v.projectUpdate.parse(req.body)))

export const tambahTahap = async (req, res) => ok(res, await proyek.addStage(id(req), v.stageCreate.parse(req.body)), 201)
export const ubahTahap = async (req, res) => {
  const skema = req.user.role === 'ADMIN' ? v.stageUpdateAdmin : v.stageUpdateArsitek
  ok(res, await proyek.updateStage(req.user, id(req), id(req, 'stageId'), skema.parse(req.body)))
}
export const geserTahap = async (req, res) => ok(res, await proyek.moveStage(id(req), id(req, 'stageId'), v.stageMove.parse(req.body).arah))
export const hapusTahap = async (req, res) => ok(res, await proyek.removeStage(id(req), id(req, 'stageId')))

export const daftarFile = async (req, res) => ok(res, await berkas.list(req.proyek))
export const unggahFile = async (req, res) => ok(res, await berkas.add(req.user, req.proyek, req.file, v.fileMeta.parse(req.body ?? {})), 201)
export const unduhFile = async (req, res) => {
  const f = await berkas.untukUnduh(req.user, id(req))
  res.download(f.lokasi, f.nama)
}
export const hapusFile = async (req, res) => { await berkas.remove(req.user, id(req)); ok(res, null) }

export const daftarKomentar = async (req, res) => ok(res, await komentar.list(req.proyek))
export const tulisKomentar = async (req, res) => ok(res, await komentar.add(req.user, req.proyek, v.commentBody.parse(req.body)), 201)

export const notifikasi = async (req, res) => ok(res, await notif.list(req.user))
export const bacaNotifikasi = async (req, res) => { await notif.tandaiDibaca(req.user, id(req)); ok(res, null) }
export const bacaSemua = async (req, res) => { await notif.tandaiSemua(req.user); ok(res, null) }

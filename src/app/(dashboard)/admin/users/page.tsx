'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  Shield,
  GraduationCap,
  Building,
  UserCheck,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Lock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type UserRole = 'PESERTA' | 'ADMIN' | 'INSTRUCTOR' | 'SPONSOR';

interface UserRecord {
  id: number;
  email: string;
  fullName: string;
  nik: string | null;
  phoneNumber: string | null;
  instansi: string | null;
  alamatInstansi: string | null;
  tempatLahir: string | null;
  tanggalLahir: string | null;
  alamatDomisili: string | null;
  role: UserRole;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  registrationsCount: number;
  hasInstructorProfile: boolean;
}

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; badgeCls: string; icon: React.ElementType }
> = {
  ADMIN: {
    label: 'Administrator',
    badgeCls: 'bg-red-100 text-red-800 border-red-200',
    icon: Shield,
  },
  INSTRUCTOR: {
    label: 'Instruktur',
    badgeCls: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: GraduationCap,
  },
  PESERTA: {
    label: 'Peserta',
    badgeCls: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: UserCheck,
  },
  SPONSOR: {
    label: 'Sponsor / Instansi',
    badgeCls: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Building,
  },
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<UserRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('PESERTA');
  const [nik, setNik] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [instansi, setInstansi] = useState('');
  const [alamatDomisili, setAlamatDomisili] = useState('');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal memuat pengguna');
      setUsers(json.data ?? []);
    } catch {
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFullName('');
    setEmail('');
    setPassword('');
    setRole('PESERTA');
    setNik('');
    setPhoneNumber('');
    setInstansi('');
    setAlamatDomisili('');
    setTempatLahir('');
    setTanggalLahir('');
    setFormOpen(true);
  };

  const handleOpenEdit = (user: UserRecord) => {
    setEditingUser(user);
    setFullName(user.fullName);
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
    setNik(user.nik || '');
    setPhoneNumber(user.phoneNumber || '');
    setInstansi(user.instansi || '');
    setAlamatDomisili(user.alamatDomisili || '');
    setTempatLahir(user.tempatLahir || '');
    setTanggalLahir(user.tanggalLahir ? user.tanggalLahir.split('T')[0] : '');
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Nama lengkap pengguna wajib diisi');
      return;
    }
    if (!email.trim()) {
      toast.error('Email pengguna wajib diisi');
      return;
    }
    if (!editingUser && !password.trim()) {
      toast.error('Password akun wajib diisi untuk pengguna baru');
      return;
    }

    setActionLoading(true);
    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser.id}`
        : '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';

      const payload: any = {
        fullName: fullName.trim(),
        email: email.trim(),
        role,
        nik: nik.trim() || null,
        phoneNumber: phoneNumber.trim() || null,
        instansi: instansi.trim() || null,
        alamatDomisili: alamatDomisili.trim() || null,
        tempatLahir: tempatLahir.trim() || null,
        tanggalLahir: tanggalLahir || null,
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan pengguna');

      toast.success(
        editingUser
          ? 'Data pengguna berhasil diperbarui'
          : 'Pengguna baru berhasil ditambahkan'
      );
      setFormOpen(false);
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan data pengguna');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (user: UserRecord) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menghapus pengguna');

      toast.success('Pengguna berhasil dihapus');
      setDeleteConfirm(null);
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus pengguna');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchRole = filterRole === 'ALL' || u.role === filterRole;
    const matchSearch =
      !search ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.nik && u.nik.includes(search)) ||
      (u.instansi && u.instansi.toLowerCase().includes(search.toLowerCase())) ||
      (u.phoneNumber && u.phoneNumber.includes(search));
    return matchRole && matchSearch;
  });

  const pesertaCount = users.filter((u) => u.role === 'PESERTA').length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const instructorCount = users.filter((u) => u.role === 'INSTRUCTOR').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola User</h1>
          <p className="text-sm text-gray-500">
            Manajemen master data akun pengguna, hak akses peran, dan data profil
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            title="Muat ulang data"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
          <Button
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Tambah User Baru
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Total Akun</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-16 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-2">{users.length}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Semua peran pengguna</p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Peserta</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-16 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-emerald-700 mt-2">{pesertaCount}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Akun peserta pelatihan</p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Instruktur</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-16 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-purple-700 mt-2">{instructorCount}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Tenaga ahli pengajar</p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Administrator</span>
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-16 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-red-700 mt-2">{adminCount}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Hak akses penuh sistem</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'ALL', label: 'Semua Peran' },
            { id: 'PESERTA', label: 'Peserta' },
            { id: 'INSTRUCTOR', label: 'Instruktur' },
            { id: 'ADMIN', label: 'Admin' },
            { id: 'SPONSOR', label: 'Sponsor' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setFilterRole(r.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                filterRole === r.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari nama, email, NIK, instansi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                    Nama & Akun
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                    Peran (Role)
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                    Instansi & NIK
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">
                    Pendaftaran
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                    Tgl Daftar
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-48 mb-1.5" />
                          <Skeleton className="h-3 w-64" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-24" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-32" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Skeleton className="h-5 w-12 mx-auto" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-24" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Skeleton className="h-7 w-16 mx-auto" />
                        </td>
                      </tr>
                    ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                      Tidak ada pengguna yang cocok dengan kriteria pencarian
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const roleMeta = ROLE_CONFIG[user.role] || {
                      label: user.role,
                      badgeCls: 'bg-gray-100 text-gray-700',
                      icon: Users,
                    };
                    const RoleIcon = roleMeta.icon;

                    return (
                      <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-slate-200">
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 leading-snug">
                                {user.fullName}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-gray-500 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-gray-400" />
                                  {user.email}
                                </span>
                                {user.phoneNumber && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-gray-400" />
                                    {user.phoneNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={cn('text-xs font-medium border px-2.5 py-0.5 flex items-center gap-1.5 w-fit', roleMeta.badgeCls)}
                          >
                            <RoleIcon className="w-3 h-3" />
                            {roleMeta.label}
                          </Badge>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                          <div>
                            <p className="font-medium text-gray-800">
                              {user.instansi || <span className="text-gray-400">-</span>}
                            </p>
                            {user.nik ? (
                              <p className="font-mono text-gray-500 text-[11px] mt-0.5">
                                NIK: {user.nik}
                              </p>
                            ) : null}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {user.registrationsCount} Batch
                          </span>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-gray-500">
                          {format(new Date(user.createdAt), 'd MMM yyyy', { locale: localeId })}
                        </td>

                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleOpenEdit(user)}
                              title="Edit user"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setDeleteConfirm(user)}
                              title="Hapus user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && setFormOpen(false)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
            </DialogTitle>
            <DialogDescription>
              Isikan data identitas, peran hak akses, dan akun login pengguna.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="usr-name">Nama Lengkap *</Label>
                <Input
                  id="usr-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Sukanta Prajanto"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="usr-email">Email Login *</Label>
                <Input
                  id="usr-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="usr-password">
                  {editingUser ? 'Password Baru (Kosongkan jika tidak diganti)' : 'Password Akun *'}
                </Label>
                <Input
                  id="usr-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingUser ? '••••••••' : 'Minimal 6 karakter'}
                  required={!editingUser}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Peran / Role Pengguna *</Label>
                <Select
                  value={role}
                  onValueChange={(val) => setRole(val as UserRole)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih peran" />
                  </SelectTrigger>
                  <SelectContent className="w-[var(--anchor-width)]">
                    <SelectItem value="PESERTA">Peserta Pelatihan</SelectItem>
                    <SelectItem value="INSTRUCTOR">Instruktur Pengajar</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                    <SelectItem value="SPONSOR">Sponsor / Instansi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="usr-nik">Nomor Induk Kependudukan (NIK)</Label>
                <Input
                  id="usr-nik"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  placeholder="16 digit NIK KTP"
                  maxLength={16}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="usr-phone">No. WhatsApp / Telepon</Label>
                <Input
                  id="usr-phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Contoh: 081234567890"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="usr-instansi">Instansi / Perusahaan Asal</Label>
                <Input
                  id="usr-instansi"
                  value={instansi}
                  onChange={(e) => setInstansi(e.target.value)}
                  placeholder="Contoh: RSUD, PT Medika, dll"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="usr-birthdate">Tanggal Lahir</Label>
                <Input
                  id="usr-birthdate"
                  type="date"
                  value={tanggalLahir}
                  onChange={(e) => setTanggalLahir(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="usr-birthplace">Tempat Lahir</Label>
              <Input
                id="usr-birthplace"
                value={tempatLahir}
                onChange={(e) => setTempatLahir(e.target.value)}
                placeholder="Contoh: Jakarta"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="usr-alamat">Alamat Domisili</Label>
              <Textarea
                id="usr-alamat"
                rows={2}
                value={alamatDomisili}
                onChange={(e) => setAlamatDomisili(e.target.value)}
                placeholder="Alamat lengkap tempat tinggal saat ini..."
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={actionLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : editingUser ? (
                  'Simpan Perubahan'
                ) : (
                  'Tambah Pengguna'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <DialogTitle className="text-base font-semibold">
                Hapus Akun Pengguna?
              </DialogTitle>
            </div>
          </DialogHeader>

          {deleteConfirm && (
            <div className="space-y-3 py-2 text-sm text-gray-600">
              <p>
                Apakah Anda yakin ingin menghapus akun pengguna{' '}
                <span className="font-semibold text-gray-900">{deleteConfirm.fullName}</span> ({deleteConfirm.email})?
              </p>

              {deleteConfirm.registrationsCount > 0 ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 space-y-1">
                  <p className="font-semibold">Peringatan:</p>
                  <p>
                    Pengguna ini memiliki {deleteConfirm.registrationsCount} riwayat pendaftaran batch pelatihan.
                    Hapus data pendaftaran terkait terlebih dahulu sebelum menghapus akun ini.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Tindakan ini permanen dan akun tidak dapat dipulihkan kembali.
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={
                !deleteConfirm ||
                deleteConfirm.registrationsCount > 0 ||
                actionLoading
              }
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus Akun'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// pages/student/StudentHomeworkPage.jsx — version corrigée
import { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, Clock, CheckCircle, X, RefreshCw } from 'lucide-react';
import { api } from '../../services/services';
import { formatDate, formatDateTime } from '../../components/utils/Helpers';
import { useAuth } from '../../components/context/AuthContext';

// ---------- Composants UI locaux ----------
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  return (
    <div className={`fixed bottom-4 right-4 z-50 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2`}>
      <span>{message}</span>
      <button onClick={onClose} className="hover:opacity-80"><X size={16} /></button>
    </div>
  );
};

const Spinner = ({ size = 24 }) => (
  <div className="flex justify-center items-center">
    <div className="border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" style={{ width: size, height: size }} />
  </div>
);

const Badge = ({ children, className }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizeClass = size === 'lg' ? 'max-w-2xl' : size === 'xl' ? 'max-w-4xl' : 'max-w-md';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className={`bg-white rounded-xl shadow-xl ${sizeClass} w-full mx-4 max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const Table = ({ columns, data, loading, emptyText = "Aucune donnée" }) => {
  if (loading) return <div className="flex justify-center py-8"><Spinner size={24} /></div>;
  if (!data || data.length === 0) return <div className="text-center py-8 text-gray-400 text-sm">{emptyText}</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIdx) => (
            <tr key={row._id || rowIdx} className="hover:bg-gray-50">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Pagination = ({ page, total, limit, onPageChange }) => {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50">Précédent</button>
      <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50">Suivant</button>
    </div>
  );
};

const Card = ({ children, className = "" }) => <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>{children}</div>;

const Button = ({ children, onClick, variant = "primary", size = "md", type = "button", loading = false, className = "" }) => {
  const base = "rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50";
  const sizes = { sm: "px-2 py-1 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-base" };
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600"
  };
  return (
    <button type={type} onClick={onClick} disabled={loading} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {loading && <Spinner size={16} />}{children}
    </button>
  );
};

// ---------- API — CORRECTION PRINCIPALE ──────────────────────────────────
// ✅ On passe page et limit comme query params séparés (pas un objet imbriqué)
// ✅ Le service api.get doit sérialiser ces params correctement
const assignmentAPI = {
  // AVANT (bugué) : api.get('/assignments/student', { params: { page, limit } })
  //   → envoyait params=[object Object] dans l'URL
  // APRÈS (correct) : on passe les params directement comme 2e argument
  //   et le service api.get les sérialise avec URLSearchParams
  getStudentAssignments: (page, limit) =>
    api.get(`/assignments/student?page=${page}&limit=${limit}`),

  submitAssignment: (id, formData) =>
    api.upload(`/assignments/${id}/submit`, formData),

  getSubmissionStatus: (id) =>
    api.get(`/assignments/${id}/submission/status`),
};

// ---------- Modal de soumission ----------
function SubmitModal({ assignment, existingSubmission, onSave, onCancel }) {
  const [comment, setComment] = useState(existingSubmission?.comment || '');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0 && !existingSubmission) {
      setToast({ message: 'Veuillez sélectionner au moins un fichier', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('comment', comment);
      files.forEach(f => formData.append('files', f));
      await assignmentAPI.submitAssignment(assignment._id, formData);
      onSave();
    } catch (err) {
      setToast({ message: err.message || 'Erreur lors de la soumission', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {toast.message && <Toast {...toast} onClose={() => setToast({ message: '', type: '' })} />}
      <div className="p-4 bg-indigo-50 rounded-xl">
        <p className="font-semibold text-gray-900">{assignment?.title}</p>
        <p className="text-xs text-gray-500 mt-1">
          Date limite : <strong className={new Date(assignment?.dueDate) < new Date() ? 'text-red-600' : 'text-gray-700'}>
            {formatDateTime(assignment?.dueDate)}
          </strong>
        </p>
        <p className="text-xs text-gray-500">Note max : {assignment?.maxScore}/20</p>
        {existingSubmission && (
          <p className="text-xs text-blue-600 mt-2">✓ Dernière soumission le {formatDateTime(existingSubmission.submittedAt)}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Commentaire</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          placeholder="Ajoutez un commentaire à votre rendu..."
          className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Fichiers (max 5 — PDF, DOC, DOCX, JPG, PNG)
        </label>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
          <Upload size={24} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Glissez vos fichiers ici ou</p>
          <label className="mt-2 inline-block cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Parcourir
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              onChange={e => setFiles(Array.from(e.target.files).slice(0, 5))}
            />
          </label>
          {existingSubmission?.files?.length > 0 && files.length === 0 && (
            <div className="mt-3 text-xs text-gray-500">
              Fichiers actuels : {existingSubmission.files.map(f => f.name).join(', ')}
            </div>
          )}
          {files.length > 0 && (
            <div className="mt-3 space-y-1">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <FileText size={12} /> {f.name}
                  <span className="ml-auto text-gray-400">{(f.size / 1024).toFixed(0)} KB</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" loading={loading} className="flex-1">
          <Upload size={15} />
          {existingSubmission ? 'Remplacer la soumission' : 'Remettre le devoir'}
        </Button>
      </div>
    </form>
  );
}

// ---------- Composant principal ----------
export default function StudentHomeworkPage() {
  const { user } = useAuth();
  const [toast, setToast] = useState({ message: '', type: '' });
  const [assignments, setAssignments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [submitModal, setSubmitModal] = useState({ open: false, assignment: null, submission: null });
  const [viewModal, setViewModal] = useState({ open: false, assignment: null });

  // ✅ CORRECTION : plus de params objet, les query params sont dans l'URL directement
  const loadAssignments = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await assignmentAPI.getStudentAssignments(page, limit);

      // ✅ Gestion robuste de la réponse
      const data = res?.data?.data ?? res?.data ?? res ?? [];
      const totalCount = res?.data?.total ?? res?.total ?? 0;

      setAssignments(Array.isArray(data) ? data : []);
      setTotal(typeof totalCount === 'number' ? totalCount : 0);
    } catch (err) {
      console.error('loadAssignments error:', err);
      setToast({ message: 'Erreur lors du chargement des devoirs', type: 'error' });
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id, page, limit]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // Vérifier le statut de soumission avant d'ouvrir la modale
  const openSubmitModal = async (assignment) => {
    try {
      const res = await assignmentAPI.getSubmissionStatus(assignment._id);
      // 404 = pas encore soumis → on catch et on met null
      const submission = res?.data?.data ?? res?.data ?? null;
      setSubmitModal({ open: true, assignment, submission });
    } catch {
      // 404 signifie pas de soumission existante → normal
      setSubmitModal({ open: true, assignment, submission: null });
    }
  };

  const pending = assignments.filter(a => !a.submittedAt && new Date(a.dueDate) >= new Date());
  const overdue = assignments.filter(a => !a.submittedAt && new Date(a.dueDate) < new Date());
  const submitted = assignments.filter(a => a.submittedAt);

  const TYPE_LABELS = {
    devoir_maison: 'Devoir maison', tp: 'TP', projet: 'Projet',
    expose: 'Exposé', rapport: 'Rapport', autre: 'Autre',
  };
  const TYPE_COLORS = {
    devoir_maison: 'bg-blue-100 text-blue-700', tp: 'bg-purple-100 text-purple-700',
    projet: 'bg-green-100 text-green-700', expose: 'bg-amber-100 text-amber-700',
    rapport: 'bg-indigo-100 text-indigo-700', autre: 'bg-gray-100 text-gray-600',
  };

  const columns = [
    {
      header: 'Devoir', key: 'title', render: (v, row) => (
        <div>
          <p className="font-medium text-gray-900 text-sm">{v}</p>
          <p className="text-xs text-gray-400">{row.course?.title}</p>
          {row.teacher && (
            <p className="text-xs text-gray-400">Prof : {row.teacher.firstName} {row.teacher.lastName}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Type', key: 'type',
      render: v => <Badge className={TYPE_COLORS[v] || 'bg-gray-100 text-gray-600'}>{TYPE_LABELS[v] || v}</Badge>,
    },
    {
      header: 'Date limite', key: 'dueDate', render: v => {
        const isOverdue = new Date(v) < new Date();
        const isSoon = !isOverdue && (new Date(v) - new Date()) < 48 * 60 * 60 * 1000;
        return (
          <div>
            <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : isSoon ? 'text-amber-600' : 'text-gray-700'}`}>
              {formatDate(v)}
            </span>
            {isOverdue && <Badge className="bg-red-100 text-red-700 ml-2">En retard</Badge>}
            {isSoon && !isOverdue && <Badge className="bg-amber-100 text-amber-700 ml-2">Bientôt</Badge>}
          </div>
        );
      },
    },
    { header: 'Note max', key: 'maxScore', render: v => `/${v}` },
    { header: 'Poids CC', key: 'weight', render: v => v ? `${v}%` : '—' },
    {
      header: 'Statut', key: 'submittedAt', render: (v, row) => {
        if (v) {
          return (
            <div>
              <Badge className="bg-green-100 text-green-700">✓ Rendu</Badge>
              <p className="text-xs text-gray-400 mt-0.5">{formatDate(v)}</p>
              {row.isLate && <Badge className="bg-orange-100 text-orange-700 mt-0.5">En retard</Badge>}
            </div>
          );
        }
        const isOverdue = new Date(row.dueDate) < new Date();
        return (
          <Badge className={isOverdue ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
            {isOverdue ? 'Non rendu (retard)' : 'À rendre'}
          </Badge>
        );
      },
    },
    {
      header: 'Actions', key: '_id', render: (_, row) => (
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => setViewModal({ open: true, assignment: row })}>Voir</Button>
          <Button size="sm" onClick={() => openSubmitModal(row)}>
            {row.submittedAt ? <RefreshCw size={13} /> : <Upload size={13} />}
            {row.submittedAt ? ' Modifier' : ' Remettre'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Devoirs & Travaux</h1>
        <p className="text-sm text-gray-500 mt-1">{total} devoir{total > 1 ? 's' : ''} disponible{total > 1 ? 's' : ''}</p>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-yellow-400">
          <div className="flex items-center gap-3">
            <Clock size={24} className="text-yellow-500" />
            <div><p className="text-xs text-gray-500">À rendre</p><p className="text-2xl font-bold text-yellow-600">{pending.length}</p></div>
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-red-400">
          <div className="flex items-center gap-3">
            <X size={24} className="text-red-500" />
            <div><p className="text-xs text-gray-500">En retard</p><p className="text-2xl font-bold text-red-600">{overdue.length}</p></div>
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-green-400">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-green-500" />
            <div><p className="text-xs text-gray-500">Rendus</p><p className="text-2xl font-bold text-green-600">{submitted.length}</p></div>
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-indigo-400">
          <div className="flex items-center gap-3">
            <FileText size={24} className="text-indigo-500" />
            <div><p className="text-xs text-gray-500">Total</p><p className="text-2xl font-bold text-indigo-600">{total}</p></div>
          </div>
        </Card>
      </div>

      {/* Tableau */}
      <Card>
        <Table columns={columns} data={assignments} loading={loading} emptyText="Aucun devoir disponible pour votre classe" />
        <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
      </Card>

      {/* Modal soumission */}
      <Modal
        isOpen={submitModal.open}
        onClose={() => setSubmitModal({ open: false, assignment: null, submission: null })}
        title="Remettre le devoir"
        size="md"
      >
        {submitModal.assignment && (
          <SubmitModal
            assignment={submitModal.assignment}
            existingSubmission={submitModal.submission}
            onSave={() => {
              setSubmitModal({ open: false, assignment: null, submission: null });
              loadAssignments();
              setToast({ message: 'Devoir remis avec succès !', type: 'success' });
            }}
            onCancel={() => setSubmitModal({ open: false, assignment: null, submission: null })}
          />
        )}
      </Modal>

      {/* Modal visualisation */}
      <Modal
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, assignment: null })}
        title="Détails du devoir"
        size="md"
      >
        {viewModal.assignment && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="font-bold text-gray-900">{viewModal.assignment.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{viewModal.assignment.description || 'Aucune description fournie.'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Cours', viewModal.assignment.course?.title || '—'],
                ['Type', TYPE_LABELS[viewModal.assignment.type] || viewModal.assignment.type],
                ['Date limite', formatDateTime(viewModal.assignment.dueDate)],
                ['Note max', `${viewModal.assignment.maxScore}/20`],
                ['Poids CC', viewModal.assignment.weight ? `${viewModal.assignment.weight}%` : '—'],
                ['Travail de groupe', viewModal.assignment.isGroupWork ? 'Oui' : 'Non'],
                ['Professeur', viewModal.assignment.teacher ? `${viewModal.assignment.teacher.firstName} ${viewModal.assignment.teacher.lastName}` : '—'],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-medium text-gray-800 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            {viewModal.assignment.submittedAt && (
              <div className="p-3 bg-blue-50 rounded-xl text-sm">
                <p className="font-medium text-blue-800">Votre soumission</p>
                <p className="text-xs text-blue-600 mt-1">Date : {formatDateTime(viewModal.assignment.submittedAt)}</p>
                {viewModal.assignment.submissionComment && (
                  <p className="text-xs text-blue-600 mt-1">Commentaire : {viewModal.assignment.submissionComment}</p>
                )}
                {viewModal.assignment.submissionFiles?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {viewModal.assignment.submissionFiles.map((f, i) => (
                      <a key={i} href={f.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-indigo-600 underline block">
                        {f.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
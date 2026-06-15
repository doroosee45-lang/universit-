// Ce fichier redirige vers ProgramsPage (onglet UE actif)
// Les deux routes /admin/programs et /admin/ues partagent la même page fusionnée.
import ProgramsPage from './ProgramsPage';

export default function UEAdminPage() {
  return <ProgramsPage defaultTab="ues" />;
}

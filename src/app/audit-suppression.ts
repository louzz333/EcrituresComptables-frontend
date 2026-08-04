export interface AuditSuppression {
  id: number;
  numeroEcriture?: number;
  dateEcriture?: string;
  journalEcriture?: string;
  compteEcriture?: string;
  montantEcriture: number;
  sensEcriture?: string;
  referenceEcriture?: string;
  deviseEcriture?: string;
  libelle: string;
  dateSuppression: string;
  motif: string;
}
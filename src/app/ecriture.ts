export interface Ecriture {
  cleMvt: number;
  n_Ecriture?: number;
  journal?: string;
  compte_comptable?: string;
  reference_Piece?: string;
  date?: string;
  libelle_Ecriture?: string;
  tiers?: string;
  sens?: string;
  type?: string;
  montant: number;
  montanT_DEVISE?: number;
  devise?: string;
  etablissement?: string;
  section_Analytique?: string;
  typE_PIECE?: string;
  societe?: string;
}
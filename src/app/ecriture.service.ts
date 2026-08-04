import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Ecriture } from './ecriture';
import { EcriturePagineeResult } from './ecriture-paginee-result';
import { Kpis } from './kpis';
import { AuditSuppression } from './audit-suppression'; 
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EcritureService {

  private formatDate(date: Date|string): string {
    if (typeof date === 'string') {
      return date;
    }
    return date.toISOString().split('T')[0];
  }

  constructor(private http: HttpClient) { }

  getAll(libelle?: string, journal?: string, datedebut?: Date|string, datefin?: Date|string, comptecomptable?: string, refpiece?: string, devise?: string, page: number = 1, pageSize: number = 10) {
    let url = 'https://localhost:7181/api/Ecritures';
    let parametres: string[] = [];

    if (libelle) parametres.push('libelle=' + libelle);
    if (journal) parametres.push('journal=' + journal);
    if (datedebut) parametres.push('datedebut=' + this.formatDate(datedebut));
    if (datefin) parametres.push('datefin=' + this.formatDate(datefin));
    if (comptecomptable) parametres.push('comptecomptable=' + comptecomptable);
    if (refpiece) parametres.push('refpiece=' + refpiece);
    if (devise) parametres.push('devise=' + devise);
    parametres.push('page=' + page);
    parametres.push('pageSize=' + pageSize);

    if (parametres.length > 0) {
      url += '?' + parametres.join('&');
    }

    return this.http.get<EcriturePagineeResult>(url);   // ← changé ici
  }

  getKpis() {
  return this.http.get<Kpis>('https://localhost:7181/api/Ecritures/kpis');
}
  supprimerEcritures(ids: number[], motif?: string) {
  return this.http.delete('https://localhost:7181/api/Ecritures', {
    body: { ids: ids, motif: motif }
  });
}

getAllIds(libelle?: string, journal?: string, datedebut?: Date|string, datefin?: Date|string, comptecomptable?: string, refpiece?: string, devise?: string) {
  let url = 'https://localhost:7181/api/Ecritures/ids';
  let parametres: string[] = [];

  if (libelle) parametres.push('libelle=' + libelle);
  if (journal) parametres.push('journal=' + journal);
  if (datedebut) parametres.push('datedebut=' + this.formatDate(datedebut));
  if (datefin) parametres.push('datefin=' + this.formatDate(datefin));
  if (comptecomptable) parametres.push('comptecomptable=' + comptecomptable);
  if (refpiece) parametres.push('refpiece=' + refpiece);
  if (devise) parametres.push('devise=' + devise);

  if (parametres.length > 0) {
    url += '?' + parametres.join('&');
  }

  return this.http.get<number[]>(url);
}

  getHistorique(
  libelle?: string,
  journal?: string,
  datedebut?: string,
  datefin?: string,
  comptecomptable?: string,
  refpiece?: string,
  devise?: string,
  page: number = 1,
  pageSize: number = 10
): Observable<any> {
  let params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize);

  if (libelle) params = params.set('libelle', libelle);
  if (journal) params = params.set('journal', journal);
  if (datedebut) params = params.set('datedebut', datedebut);
  if (datefin) params = params.set('datefin', datefin);
  if (comptecomptable) params = params.set('comptecomptable', comptecomptable);
  if (refpiece) params = params.set('refpiece', refpiece);
  if (devise) params = params.set('devise', devise);

  return this.http.get<any>('https://localhost:7181/api/Ecritures/historique', { params });
}
}

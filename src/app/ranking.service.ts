import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Jugador {
  id: string;
  nombre: string;
  puntaje: number;
}

@Injectable({ providedIn: 'root' })
export class RankingService {
  private jugadoresSubject = new BehaviorSubject<Jugador[]>([]);
  jugadores$: Observable<Jugador[]> = this.jugadoresSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** SIEMPRE carga desde JSON */
  cargarDatos(): void {
    this.http.get<Jugador[]>('/assets/ranking.json').pipe(
      tap(data => {
        this.jugadoresSubject.next(this.ordenar(data));
      })
    ).subscribe();
  }

  private ordenar(lista: Jugador[]): Jugador[] {
    return [...lista].sort((a, b) => b.puntaje - a.puntaje);
  }

  obtenerJugadores(): Jugador[] {
    return this.jugadoresSubject.getValue();
  }

  /** ── CRUD EN MEMORIA (NO persistente) ── */

  agregarJugador(nombre: string, puntaje: number): void {
    const lista = this.obtenerJugadores();
    const nuevo: Jugador = {
      id: Date.now().toString(),
      nombre: nombre.trim(),
      puntaje
    };
    this.jugadoresSubject.next(this.ordenar([...lista, nuevo]));
  }

  editarPuntaje(id: string, nuevoPuntaje: number): void {
    const lista = this.obtenerJugadores().map(j =>
      j.id === id ? { ...j, puntaje: nuevoPuntaje } : j
    );
    this.jugadoresSubject.next(this.ordenar(lista));
  }

  sumarPuntos(id: string, puntos: number): void {
    const lista = this.obtenerJugadores().map(j =>
      j.id === id ? { ...j, puntaje: j.puntaje + puntos } : j
    );
    this.jugadoresSubject.next(this.ordenar(lista));
  }

  restarPuntos(id: string, puntos: number): void {
    const lista = this.obtenerJugadores().map(j =>
      j.id === id ? { ...j, puntaje: Math.max(0, j.puntaje - puntos) } : j
    );
    this.jugadoresSubject.next(this.ordenar(lista));
  }

  eliminarJugador(id: string): void {
    const lista = this.obtenerJugadores().filter(j => j.id !== id);
    this.jugadoresSubject.next(this.ordenar(lista));
  }

  /** RESET = volver a cargar JSON */
  resetearAJson(): void {
    this.cargarDatos();
  }

  /** 🔥 EXPORTAR JSON */
  exportarJSON(): void {
    const data = this.obtenerJugadores();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ranking.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
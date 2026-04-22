import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Jugador {
  id: string;
  nombre: string;
  puntaje: number;
}

const STORAGE_KEY = 'truco_ranking';

@Injectable({ providedIn: 'root' })
export class RankingService {
  private jugadoresSubject = new BehaviorSubject<Jugador[]>([]);
  jugadores$: Observable<Jugador[]> = this.jugadoresSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Carga inicial: LocalStorage → JSON */
  cargarDatos(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: Jugador[] = JSON.parse(stored);
        this.jugadoresSubject.next(this.ordenar(data));
        return;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    this.http.get<Jugador[]>('assets/ranking.json').pipe(
      tap(data => {
        this.jugadoresSubject.next(this.ordenar(data));
      })
    ).subscribe();
  }

  private ordenar(lista: Jugador[]): Jugador[] {
    return [...lista].sort((a, b) => b.puntaje - a.puntaje);
  }

  private guardarEnStorage(lista: Jugador[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    this.jugadoresSubject.next(this.ordenar(lista));
  }

  obtenerJugadores(): Jugador[] {
    return this.jugadoresSubject.getValue();
  }

  agregarJugador(nombre: string, puntaje: number): void {
    const lista = this.obtenerJugadores();
    const nuevo: Jugador = {
      id: Date.now().toString(),
      nombre: nombre.trim(),
      puntaje
    };
    this.guardarEnStorage([...lista, nuevo]);
  }

  editarPuntaje(id: string, nuevoPuntaje: number): void {
    const lista = this.obtenerJugadores().map(j =>
      j.id === id ? { ...j, puntaje: nuevoPuntaje } : j
    );
    this.guardarEnStorage(lista);
  }

  sumarPuntos(id: string, puntos: number): void {
    const lista = this.obtenerJugadores().map(j =>
      j.id === id ? { ...j, puntaje: j.puntaje + puntos } : j
    );
    this.guardarEnStorage(lista);
  }

  restarPuntos(id: string, puntos: number): void {
    const lista = this.obtenerJugadores().map(j =>
      j.id === id ? { ...j, puntaje: Math.max(0, j.puntaje - puntos) } : j
    );
    this.guardarEnStorage(lista);
  }

  eliminarJugador(id: string): void {
    const lista = this.obtenerJugadores().filter(j => j.id !== id);
    this.guardarEnStorage(lista);
  }

  resetearAJson(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.http.get<Jugador[]>('assets/ranking.json').pipe(
      tap(data => this.jugadoresSubject.next(this.ordenar(data)))
    ).subscribe();
  }
}
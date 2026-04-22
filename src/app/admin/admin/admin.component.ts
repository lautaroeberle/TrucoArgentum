import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RankingService, Jugador } from '../../ranking.service';

type Vista = 'login' | 'panel';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  vista: Vista = 'login';

  // Login
  loginUsuario = '';
  loginPassword = '';
  loginError = '';

  // Jugadores
  jugadores: Jugador[] = [];

  // Formulario nuevo jugador
  nuevoNombre = '';
  nuevoPuntaje: number | null = null;
  errorNuevo = '';
  exitoNuevo = '';

  // Edición inline
  editandoId: string | null = null;
  editNombre = '';
  editPuntaje: number = 0;

  // Suma/resta rápida
  deltaMap: { [id: string]: number } = {};

  // Mensaje de estado global
  mensajeGlobal = '';

  constructor(private rankingService: RankingService) {}

  ngOnInit(): void {
    this.rankingService.cargarDatos();
    this.rankingService.jugadores$.subscribe(data => {
      this.jugadores = data;
    });
  }

  // ── LOGIN ──────────────────────────────────────────
  intentarLogin(): void {
    if (this.loginUsuario === 'admin' && this.loginPassword === '1234') {
      this.vista = 'panel';
      this.loginError = '';
    } else {
      this.loginError = 'Usuario o contraseña incorrectos.';
    }
  }

  cerrarSesion(): void {
    this.vista = 'login';
    this.loginUsuario = '';
    this.loginPassword = '';
  }

  // ── AGREGAR ────────────────────────────────────────
  agregarJugador(): void {
    this.errorNuevo = '';
    this.exitoNuevo = '';

    if (!this.nuevoNombre.trim()) {
      this.errorNuevo = 'El nombre no puede estar vacío.';
      return;
    }
    if (this.nuevoPuntaje === null || this.nuevoPuntaje < 0) {
      this.errorNuevo = 'Ingresá un puntaje válido.';
      return;
    }

    this.rankingService.agregarJugador(this.nuevoNombre, this.nuevoPuntaje);
    this.exitoNuevo = `"${this.nuevoNombre}" agregado al ranking.`;
    this.nuevoNombre = '';
    this.nuevoPuntaje = null;
    this.mostrarMensaje(`Jugador agregado correctamente.`);
  }

  // ── EDICIÓN INLINE ─────────────────────────────────
  iniciarEdicion(j: Jugador): void {
    this.editandoId = j.id;
    this.editNombre = j.nombre;
    this.editPuntaje = j.puntaje;
  }

  guardarEdicion(): void {
    if (!this.editandoId) return;
    this.rankingService.editarPuntaje(this.editandoId, this.editPuntaje);
    this.editandoId = null;
    this.mostrarMensaje('Cambios guardados.');
  }

  cancelarEdicion(): void {
    this.editandoId = null;
  }

  // ── DELTA (suma/resta) ─────────────────────────────
  getDelta(id: string): number {
    return this.deltaMap[id] ?? 0;
  }

  setDelta(id: string, valor: number): void {
    this.deltaMap[id] = valor;
  }

  sumar(id: string): void {
    const delta = this.getDelta(id);
    if (delta <= 0) return;
    this.rankingService.sumarPuntos(id, delta);
    this.mostrarMensaje(`+${delta} puntos aplicados.`);
  }

  restar(id: string): void {
    const delta = this.getDelta(id);
    if (delta <= 0) return;
    this.rankingService.restarPuntos(id, delta);
    this.mostrarMensaje(`-${delta} puntos aplicados.`);
  }

  // ── ELIMINAR ───────────────────────────────────────
  eliminar(j: Jugador): void {
    if (!confirm(`¿Eliminar a "${j.nombre}" del ranking?`)) return;
    this.rankingService.eliminarJugador(j.id);
    this.mostrarMensaje(`"${j.nombre}" eliminado.`);
  }

  // ── RESET ──────────────────────────────────────────
  resetear(): void {
    if (!confirm('¿Resetear el ranking al estado original del JSON? Esto borrará todos los cambios.')) return;
    this.rankingService.resetearAJson();
    this.mostrarMensaje('Ranking reseteado al estado original.');
  }

  // ── HELPERS ────────────────────────────────────────
  private mostrarMensaje(msg: string): void {
    this.mensajeGlobal = msg;
    setTimeout(() => (this.mensajeGlobal = ''), 3000);
  }
}
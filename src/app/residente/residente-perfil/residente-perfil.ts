import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-residente-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './residente-perfil.html',
  styleUrls: ['./residente-perfil.css'],
})
export class ResidentePerfilComponent implements OnInit {
  constructor(
    private router: Router,
    public authService: AuthService,
    public profileService: ProfileService,
  ) {}

  ngOnInit() {
    // Si se entra directo a esta pantalla (sin pasar por el home), cargar el perfil.
    if (!this.profileService.perfil()) {
      this.profileService.cargarPerfil().subscribe();
    }
  }

  volver() {
    this.router.navigate(['/residente-home']);
  }

  logout() {
    this.authService.logout();
  }
}

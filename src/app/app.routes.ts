import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login';

import { ResidenteCambiarContraComponent } from './residente/residente-cambiar-contra/residente-cambiar-contra';
import { ResidenteHomeComponent } from './residente/residente-home/residente-home';
import { ResidenteDocumentosComponent } from './residente/residente-documentos/residente-documentos';
import { ResidenteHistorialComponent } from './residente/residente-historial/residente-historial';

import { AdminHomeComponent } from './admin/admin-home/admin-home';
import { AdminGestionUsuariosComponent } from './admin/admin-gestion-usuarios/admin-gestion-usuarios';
import { AdminCrearUsuarioComponent } from './admin/admin-crear-usuario/admin-crear-usuario';
import { AdminEditarUsuarioComponent } from './admin/admin-editar-usuario/admin-editar-usuario';
import { AdminReportesComponent } from './admin/admin-reportes/admin-reportes';
import { AdminDocumentosUsuarioComponent } from './admin/admin-documentos-usuario/admin-documentos-usuario';
import { AdminCambiarContrasenaComponent } from './admin/admin-cambiar-contrasena/admin-cambiar-contrasena';

import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },

    { path: 'residente-cambiar-contra', component: ResidenteCambiarContraComponent, canActivate: [authGuard] },
    { path: 'residente-home', component: ResidenteHomeComponent, canActivate: [authGuard, roleGuard(['RESIDENTE'])] },
    { path: 'residente-documentos', component: ResidenteDocumentosComponent, canActivate: [authGuard, roleGuard(['RESIDENTE'])] },
    { path: 'residente-historial', component: ResidenteHistorialComponent, canActivate: [authGuard, roleGuard(['RESIDENTE'])] },

    { path: 'admin-home', component: AdminHomeComponent, canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN'])] },
    { path: 'admin-gestion-usuarios', component: AdminGestionUsuariosComponent, canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN'])] },
    { path: 'admin-crear-usuario', component: AdminCrearUsuarioComponent, canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN'])] },
    { path: 'admin-editar-usuario', component: AdminEditarUsuarioComponent, canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN'])] },
    { path: 'admin-reportes', component: AdminReportesComponent, canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN'])] },
    { path: 'admin-documentos-usuario', component: AdminDocumentosUsuarioComponent, canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN'])] },
    { path: 'admin-cambiar-contrasena', component: AdminCambiarContrasenaComponent, canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN'])] },

    { path: '**', redirectTo: 'login' },
];

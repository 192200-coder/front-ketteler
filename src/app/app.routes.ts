import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login';

import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },

    {
        path: 'residente-cambiar-contra',
        loadComponent: () =>
            import('./residente/residente-cambiar-contra/residente-cambiar-contra').then(
                (m) => m.ResidenteCambiarContraComponent,
            ),
        canActivate: [authGuard],
    },
    {
        path: 'residente-home',
        loadComponent: () =>
            import('./residente/residente-home/residente-home').then((m) => m.ResidenteHomeComponent),
        canActivate: [authGuard, roleGuard(['RESIDENTE'])],
    },
    {
        path: 'residente-documentos',
        loadComponent: () =>
            import('./residente/residente-documentos/residente-documentos').then(
                (m) => m.ResidenteDocumentosComponent,
            ),
        canActivate: [authGuard, roleGuard(['RESIDENTE'])],
    },
    {
        path: 'residente-historial',
        loadComponent: () =>
            import('./residente/residente-historial/residente-historial').then(
                (m) => m.ResidenteHistorialComponent,
            ),
        canActivate: [authGuard, roleGuard(['RESIDENTE'])],
    },
    {
        path: 'residente-perfil',
        loadComponent: () =>
            import('./residente/residente-perfil/residente-perfil').then(
                (m) => m.ResidentePerfilComponent,
            ),
        canActivate: [authGuard, roleGuard(['RESIDENTE'])],
    },

    {
        path: 'admin-home',
        loadComponent: () => import('./admin/admin-home/admin-home').then((m) => m.AdminHomeComponent),
        canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN'])],
    },
    {
        path: 'admin-gestion-usuarios',
        loadComponent: () =>
            import('./admin/admin-gestion-usuarios/admin-gestion-usuarios').then(
                (m) => m.AdminGestionUsuariosComponent,
            ),
        canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN'])],
    },
    {
        path: 'admin-crear-usuario',
        loadComponent: () =>
            import('./admin/admin-crear-usuario/admin-crear-usuario').then(
                (m) => m.AdminCrearUsuarioComponent,
            ),
        canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN'])],
    },
    {
        path: 'admin-editar-usuario',
        loadComponent: () =>
            import('./admin/admin-editar-usuario/admin-editar-usuario').then(
                (m) => m.AdminEditarUsuarioComponent,
            ),
        canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN'])],
    },
    {
        path: 'admin-reportes',
        loadComponent: () =>
            import('./admin/admin-reportes/admin-reportes').then((m) => m.AdminReportesComponent),
        canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN'])],
    },
    {
        path: 'admin-documentos-usuario',
        loadComponent: () =>
            import('./admin/admin-documentos-usuario/admin-documentos-usuario').then(
                (m) => m.AdminDocumentosUsuarioComponent,
            ),
        canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN'])],
    },
    {
        path: 'admin-cambiar-contrasena',
        loadComponent: () =>
            import('./admin/admin-cambiar-contrasena/admin-cambiar-contrasena').then(
                (m) => m.AdminCambiarContrasenaComponent,
            ),
        canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN'])],
    },

    { path: '**', redirectTo: 'login' },
];

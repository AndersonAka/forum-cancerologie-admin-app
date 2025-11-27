# Intégration Frontend - Vidéos Regardées

## 📋 Vue d'ensemble

Ce document décrit comment récupérer et afficher les données de vidéos regardées dans le frontend. L'API fournit toutes les vidéos regardées avec les informations des utilisateurs associés, formatées de manière similaire aux visites de pages.

> **📤 Pour enregistrer les vidéos regardées** : Consultez le document [FRONTEND_VIDEO_WATCHES_TRACKING.md](./FRONTEND_VIDEO_WATCHES_TRACKING.md) qui explique comment envoyer les données lorsqu'un utilisateur regarde une vidéo.

## 🔗 Endpoint API

### Route principale : `GET /video-watches/all-with-users`

**URL complète :** `http://localhost:3001/video-watches/all-with-users`

**Méthode :** `GET`

**Authentification :** Requise (Bearer Token)

**Headers :**
```
Authorization: Bearer <votre_token_jwt>
Content-Type: application/json
```

**Paramètres de requête (optionnels) :**
- `skip` : Nombre d'éléments à ignorer (pour la pagination, par défaut : 0)
- `take` : Nombre d'éléments à retourner (pour la pagination, par défaut : tous)

**Exemples d'URL :**
- `GET /video-watches/all-with-users` - Retourne toutes les vidéos regardées
- `GET /video-watches/all-with-users?skip=0&take=20` - Première page (20 éléments)
- `GET /video-watches/all-with-users?skip=20&take=20` - Deuxième page (20 éléments)

## 📦 Structure de la réponse

### Format de réponse

```typescript
interface VideoWatchResponse {
  id: number;                    // ID de la visualisation
  userId: number;                // ID de l'utilisateur
  videoId: string;               // ID de la vidéo
  startTime: string;             // Date de début (ISO 8601)
  endTime: string | null;        // Date de fin (ISO 8601, peut être null)
  duration: number | null;       // Durée en secondes (peut être null)
  progress: number | null;       // Progression en pourcentage 0-100 (peut être null)
  completed: boolean;            // Vidéo complétée ou non
  auteur: string;                // Auteur de la vidéo
  dateVisualisation: string;     // Date de visualisation (ISO 8601)
  user: {
    id: number;                  // ID de l'utilisateur
    firstName: string;            // Prénom
    lastName: string;             // Nom
    email: string;               // Email
  };
}

interface PaginatedResponse {
  data: VideoWatchResponse[];      // Tableau des vidéos regardées
  pagination: {
    total: number;                // Nombre total de visualisations
    skip: number;                 // Nombre d'éléments ignorés
    take: number;                 // Nombre d'éléments retournés
    hasMore: boolean;             // Indique s'il y a plus de pages
  };
}
```

### Exemple de réponse

```json
{
  "data": [
    {
      "id": 1,
      "userId": 11,
      "videoId": "video-123",
      "startTime": "2025-11-27T04:22:43.000Z",
      "endTime": "2025-11-27T04:25:08.000Z",
      "duration": 145,
      "progress": 100,
      "completed": true,
      "auteur": "Dr. Martin",
      "dateVisualisation": "2025-11-27T04:22:43.000Z",
      "user": {
        "id": 11,
        "firstName": "Anderson",
        "lastName": "Aka",
        "email": "admin@impactafrik.com"
      }
    },
    {
      "id": 2,
      "userId": 12,
      "videoId": "video-456",
      "startTime": "2025-11-27T04:20:15.000Z",
      "endTime": null,
      "duration": 45,
      "progress": 30,
      "completed": false,
      "auteur": "Dr. Dupont",
      "dateVisualisation": "2025-11-27T04:20:15.000Z",
      "user": {
        "id": 12,
        "firstName": "Jean",
        "lastName": "Dupont",
        "email": "jean.dupont@example.com"
      }
    }
  ],
  "pagination": {
    "total": 150,
    "skip": 0,
    "take": 20,
    "hasMore": true
  }
}
```

## 💻 Exemple d'implémentation React/Next.js

### 1. Service API

Créez un fichier `services/videoWatchesService.ts` :

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface VideoWatch {
  id: number;
  userId: number;
  videoId: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  progress: number | null;
  completed: boolean;
  auteur: string;
  dateVisualisation: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface PaginatedVideoWatches {
  data: VideoWatch[];
  pagination: {
    total: number;
    skip: number;
    take: number;
    hasMore: boolean;
  };
}

export interface FormattedVideoWatch {
  id: number;
  userId: number;
  userName: string;              // "Prénom Nom"
  userEmail: string;
  videoId: string;
  duration: number | null;
  durationFormatted: string;     // "2m 25s" ou "N/A"
  progress: number | null;
  progressFormatted: string;     // "100%" ou "30%" ou "N/A"
  completed: boolean;
  completedFormatted: string;    // "✅ Complétée" ou "⏸️ En cours"
  auteur: string;
  dateVisualisation: string;     // Formatée en français
  startTime: string;             // Formatée en français
}

export const videoWatchesService = {
  /**
   * Récupère les vidéos regardées avec les informations utilisateur
   * @param token - Token JWT d'authentification
   * @param skip - Nombre d'éléments à ignorer (pagination)
   * @param take - Nombre d'éléments à retourner (pagination)
   */
  async getAllVideoWatches(
    token: string,
    skip?: number,
    take?: number
  ): Promise<PaginatedVideoWatches> {
    const params = new URLSearchParams();
    if (skip !== undefined) params.append('skip', skip.toString());
    if (take !== undefined) params.append('take', take.toString());

    const url = `${API_BASE_URL}/video-watches/all-with-users${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await axios.get<PaginatedVideoWatches>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  /**
   * Formate les données pour l'affichage
   */
  formatVideoWatches(watches: VideoWatch[]): FormattedVideoWatch[] {
    return watches.map((watch) => {
      const userName = `${watch.user.firstName} ${watch.user.lastName}`;
      
      // Formater la durée
      let durationFormatted = 'N/A';
      if (watch.duration !== null) {
        const minutes = Math.floor(watch.duration / 60);
        const seconds = watch.duration % 60;
        durationFormatted = `${minutes}m ${seconds}s`;
      }

      // Formater la progression
      let progressFormatted = 'N/A';
      if (watch.progress !== null) {
        progressFormatted = `${watch.progress}%`;
      }

      // Formater le statut de complétion
      const completedFormatted = watch.completed ? '✅ Complétée' : '⏸️ En cours';

      // Formater la date de visualisation
      const dateVis = new Date(watch.dateVisualisation);
      const dateVisualisation = dateVis.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      // Formater l'heure de début
      const start = new Date(watch.startTime);
      const startTime = start.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      return {
        id: watch.id,
        userId: watch.userId,
        userName,
        userEmail: watch.user.email,
        videoId: watch.videoId,
        duration: watch.duration,
        durationFormatted,
        progress: watch.progress,
        progressFormatted,
        completed: watch.completed,
        completedFormatted,
        auteur: watch.auteur,
        dateVisualisation,
        startTime,
      };
    });
  },
};
```

### 2. Hook React personnalisé

Créez un fichier `hooks/useVideoWatches.ts` :

```typescript
import { useState, useEffect } from 'react';
import { videoWatchesService, FormattedVideoWatch } from '@/services/videoWatchesService';

export const useVideoWatches = (
  token: string | null,
  skip?: number,
  take?: number
) => {
  const [videoWatches, setVideoWatches] = useState<FormattedVideoWatch[]>([]);
  const [pagination, setPagination] = useState<{
    total: number;
    skip: number;
    take: number;
    hasMore: boolean;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchVideoWatches = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await videoWatchesService.getAllVideoWatches(token, skip, take);
        const formattedWatches = videoWatchesService.formatVideoWatches(response.data);
        setVideoWatches(formattedWatches);
        setPagination(response.pagination);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors de la récupération des vidéos regardées');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoWatches();
  }, [token, skip, take]);

  return { videoWatches, pagination, loading, error };
};
```

### 3. Composant d'affichage

Créez un fichier `components/VideoWatchesTable.tsx` :

```typescript
'use client';

import { useVideoWatches } from '@/hooks/useVideoWatches';
import { useAuth } from '@/contexts/AuthContext'; // Adaptez selon votre contexte d'auth

export default function VideoWatchesTable() {
  const { token } = useAuth(); // Récupérez le token depuis votre contexte
  const { videoWatches, pagination, loading, error } = useVideoWatches(token);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des vidéos regardées...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">❌ {error}</p>
      </div>
    );
  }

  if (videoWatches.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">Aucune vidéo regardée enregistrée.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Utilisateur
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID Vidéo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Auteur
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Durée
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progression
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date de visualisation
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {videoWatches.map((watch) => (
            <tr key={watch.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {watch.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {watch.userName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {watch.userEmail}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {watch.videoId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {watch.auteur}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {watch.durationFormatted}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {watch.progressFormatted}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  watch.completed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {watch.completedFormatted}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {watch.dateVisualisation}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {pagination && (
        <div className="mt-4 text-sm text-gray-600">
          Total: {pagination.total} visualisation(s) | 
          Affichage: {pagination.skip + 1} - {Math.min(pagination.skip + pagination.take, pagination.total)} | 
          {pagination.hasMore && ' Plus de résultats disponibles'}
        </div>
      )}
    </div>
  );
}
```

## 📊 Autres endpoints disponibles

### Statistiques d'une vidéo
```typescript
GET /video-watches/stats/:videoId
```

Retourne :
- `totalWatches` : Nombre total de visualisations
- `totalDuration` : Durée totale regardée
- `averageDuration` : Durée moyenne
- `completedWatches` : Nombre de vidéos complétées
- `completionRate` : Taux de complétion (0-1)
- `averageProgress` : Progression moyenne
- `uniqueViewers` : Nombre de viewers uniques

### Vidéos récentes
```typescript
GET /video-watches/recent?limit=10
```

### Vidéos les plus regardées
```typescript
GET /video-watches/most-watched?limit=10
```

## ⚠️ Notes importantes

1. **Authentification** : Toutes les routes nécessitent un token JWT valide
2. **Gestion d'erreurs** : Implémentez une gestion d'erreurs robuste
3. **Performance** : Pour de grandes quantités de données, utilisez la pagination
4. **Sécurité** : Ne jamais exposer le token JWT dans le code client

## 📝 Checklist d'implémentation

- [ ] Créer le service API (`videoWatchesService.ts`)
- [ ] Créer le hook React (`useVideoWatches.ts`)
- [ ] Créer le composant de tableau (`VideoWatchesTable.tsx`)
- [ ] Créer la page d'administration
- [ ] Ajouter la gestion d'erreurs
- [ ] Ajouter le loading state
- [ ] Implémenter la pagination
- [ ] Tester avec différents scénarios

---

**Dernière mise à jour :** 27 novembre 2025


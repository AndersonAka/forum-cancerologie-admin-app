# Intégration Frontend - Visites de Pages

## 📋 Vue d'ensemble

Ce document décrit comment intégrer l'affichage des données de visites de pages dans le frontend. L'API fournit toutes les visites de pages avec les informations des utilisateurs associés, formatées de la même manière que le script d'export Excel.

## 🔗 Endpoint API

### Route principale : `GET /page-visits/all-with-users`

**URL complète :** `http://localhost:3001/page-visits/all-with-users`

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
- `GET /page-visits/all-with-users` - Retourne toutes les visites
- `GET /page-visits/all-with-users?skip=0&take=20` - Première page (20 éléments)
- `GET /page-visits/all-with-users?skip=20&take=20` - Deuxième page (20 éléments)

## 📦 Structure de la réponse

### Format de réponse

```typescript
interface PageVisitResponse {
  id: number;                    // ID de la visite
  userId: number;                // ID de l'utilisateur
  pageUrl: string;               // URL de la page visitée
  timeSpent: number | null;      // Temps passé en secondes (peut être null)
  createdAt: string;              // Date de création (ISO 8601)
  user: {
    id: number;                  // ID de l'utilisateur
    firstName: string;            // Prénom
    lastName: string;             // Nom
    email: string;               // Email
  };
}

interface PaginatedResponse {
  data: PageVisitResponse[];      // Tableau des visites
  pagination: {
    total: number;                // Nombre total de visites
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
      "pageUrl": "/dashboard",
      "timeSpent": 125,
      "createdAt": "2025-11-27T04:22:43.000Z",
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
      "pageUrl": "/videos",
      "timeSpent": 45,
      "createdAt": "2025-11-27T04:20:15.000Z",
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

Créez un fichier `services/pageVisitsService.ts` :

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface PageVisit {
  id: number;
  userId: number;
  pageUrl: string;
  timeSpent: number | null;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface FormattedPageVisit {
  id: number;
  userId: number;
  userName: string;              // "Prénom Nom"
  userEmail: string;
  pageUrl: string;
  timeSpent: number | null;
  timeSpentFormatted: string;    // "2m 5s" ou "N/A"
  dateVisited: string;           // Formatée en français
}

export interface PaginatedPageVisits {
  data: PageVisit[];
  pagination: {
    total: number;
    skip: number;
    take: number;
    hasMore: boolean;
  };
}

export const pageVisitsService = {
  /**
   * Récupère les visites de pages avec les informations utilisateur
   * @param token - Token JWT d'authentification
   * @param skip - Nombre d'éléments à ignorer (pagination)
   * @param take - Nombre d'éléments à retourner (pagination)
   */
  async getAllPageVisits(
    token: string,
    skip?: number,
    take?: number
  ): Promise<PaginatedPageVisits> {
    const params = new URLSearchParams();
    if (skip !== undefined) params.append('skip', skip.toString());
    if (take !== undefined) params.append('take', take.toString());

    const url = `${API_BASE_URL}/page-visits/all-with-users${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await axios.get<PaginatedPageVisits>(url, {
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
  formatPageVisits(visits: PageVisit[]): FormattedPageVisit[] {
    return visits.map((visit) => {
      const userName = `${visit.user.firstName} ${visit.user.lastName}`;
      
      // Formater le temps passé
      let timeSpentFormatted = 'N/A';
      if (visit.timeSpent !== null) {
        const minutes = Math.floor(visit.timeSpent / 60);
        const seconds = visit.timeSpent % 60;
        timeSpentFormatted = `${minutes}m ${seconds}s`;
      }

      // Formater la date
      const date = new Date(visit.createdAt);
      const dateVisited = date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      return {
        id: visit.id,
        userId: visit.userId,
        userName,
        userEmail: visit.user.email,
        pageUrl: visit.pageUrl,
        timeSpent: visit.timeSpent,
        timeSpentFormatted,
        dateVisited,
      };
    });
  },
};
```

### 2. Hook React personnalisé

Créez un fichier `hooks/usePageVisits.ts` :

```typescript
import { useState, useEffect } from 'react';
import { pageVisitsService, FormattedPageVisit } from '@/services/pageVisitsService';

export const usePageVisits = (
  token: string | null,
  skip?: number,
  take?: number
) => {
  const [pageVisits, setPageVisits] = useState<FormattedPageVisit[]>([]);
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

    const fetchPageVisits = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await pageVisitsService.getAllPageVisits(token, skip, take);
        const formattedVisits = pageVisitsService.formatPageVisits(response.data);
        setPageVisits(formattedVisits);
        setPagination(response.pagination);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors de la récupération des visites');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPageVisits();
  }, [token, skip, take]);

  return { pageVisits, pagination, loading, error };
};
```

### 3. Composant d'affichage

Créez un fichier `components/PageVisitsTable.tsx` :

```typescript
'use client';

import { usePageVisits } from '@/hooks/usePageVisits';
import { useAuth } from '@/contexts/AuthContext'; // Adaptez selon votre contexte d'auth

export default function PageVisitsTable() {
  const { token } = useAuth(); // Récupérez le token depuis votre contexte
  const { pageVisits, loading, error } = usePageVisits(token);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des visites...</span>
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

  if (pageVisits.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">Aucune visite de page enregistrée.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID Visite
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Utilisateur
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              URL de la page
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Temps passé
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date de visite
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {pageVisits.map((visit) => (
            <tr key={visit.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {visit.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {visit.userName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {visit.userEmail}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                <a
                  href={visit.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline truncate block max-w-xs"
                >
                  {visit.pageUrl}
                </a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {visit.timeSpentFormatted}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {visit.dateVisited}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-sm text-gray-600">
        Total: {pageVisits.length} visite(s)
      </div>
    </div>
  );
}
```

### 4. Page d'administration

Créez une page `app/admin/page-visits/page.tsx` :

```typescript
'use client';

import PageVisitsTable from '@/components/PageVisitsTable';

export default function PageVisitsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Visites de Pages
        </h1>
        <p className="text-gray-600">
          Liste de toutes les visites de pages enregistrées dans le système
        </p>
      </div>
      
      <PageVisitsTable />
    </div>
  );
}
```

## 🎨 Améliorations possibles

### 1. Filtrage et recherche

```typescript
const [searchTerm, setSearchTerm] = useState('');
const [filterByUser, setFilterByUser] = useState<string>('');

const filteredVisits = pageVisits.filter((visit) => {
  const matchesSearch = 
    visit.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.pageUrl.toLowerCase().includes(searchTerm.toLowerCase());
  
  const matchesUser = filterByUser === '' || visit.userEmail === filterByUser;
  
  return matchesSearch && matchesUser;
});
```

### 2. Tri des colonnes

```typescript
const [sortBy, setSortBy] = useState<'date' | 'user' | 'time'>('date');
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

const sortedVisits = [...filteredVisits].sort((a, b) => {
  let comparison = 0;
  
  switch (sortBy) {
    case 'date':
      comparison = new Date(a.dateVisited).getTime() - new Date(b.dateVisited).getTime();
      break;
    case 'user':
      comparison = a.userName.localeCompare(b.userName);
      break;
    case 'time':
      comparison = (a.timeSpent || 0) - (b.timeSpent || 0);
      break;
  }
  
  return sortOrder === 'asc' ? comparison : -comparison;
});
```

### 3. Pagination (côté serveur)

```typescript
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 20;
const skip = (currentPage - 1) * itemsPerPage;

const { pageVisits, pagination, loading, error } = usePageVisits(
  token,
  skip,
  itemsPerPage
);

// Navigation entre les pages
const handleNextPage = () => {
  if (pagination?.hasMore) {
    setCurrentPage((prev) => prev + 1);
  }
};

const handlePrevPage = () => {
  if (currentPage > 1) {
    setCurrentPage((prev) => prev - 1);
  }
};

// Calcul du nombre total de pages
const totalPages = pagination ? Math.ceil(pagination.total / itemsPerPage) : 0;
```

### 4. Export Excel (optionnel)

Si vous voulez permettre l'export Excel côté frontend :

```typescript
import * as XLSX from 'xlsx';

const exportToExcel = () => {
  const excelData = pageVisits.map((visit) => ({
    'ID Visite': visit.id,
    'ID Utilisateur': visit.userId,
    'Prénom': visit.userName.split(' ')[0],
    'Nom': visit.userName.split(' ').slice(1).join(' '),
    'Nom complet': visit.userName,
    'Email': visit.userEmail,
    'URL de la page': visit.pageUrl,
    'Temps passé (secondes)': visit.timeSpent || '',
    'Temps passé (formaté)': visit.timeSpentFormatted,
    'Date de visite': visit.dateVisited,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Visites de pages');
  
  const fileName = `page-visits-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
```

## 📊 Statistiques supplémentaires

Vous pouvez également utiliser les autres endpoints disponibles :

- `GET /page-visits/recent?limit=10` - Visites récentes
- `GET /page-visits/most-visited?limit=10` - Pages les plus visitées
- `GET /page-visits/stats/:pageUrl` - Statistiques d'une page spécifique

## ⚠️ Notes importantes

1. **Authentification** : Toutes les routes nécessitent un token JWT valide
2. **Gestion d'erreurs** : Implémentez une gestion d'erreurs robuste pour les cas de token expiré
3. **Performance** : Pour de grandes quantités de données, implémentez la pagination côté serveur
4. **Sécurité** : Ne jamais exposer le token JWT dans le code client ou les logs

## 🔄 Mise à jour en temps réel (optionnel)

Pour un affichage en temps réel, vous pouvez utiliser des WebSockets ou polling :

```typescript
useEffect(() => {
  if (!token) return;

  const interval = setInterval(() => {
    // Rafraîchir les données toutes les 30 secondes
    fetchPageVisits();
  }, 30000);

  return () => clearInterval(interval);
}, [token]);
```

## 📝 Checklist d'implémentation

- [ ] Créer le service API (`pageVisitsService.ts`)
- [ ] Créer le hook React (`usePageVisits.ts`)
- [ ] Créer le composant de tableau (`PageVisitsTable.tsx`)
- [ ] Créer la page d'administration
- [ ] Ajouter la gestion d'erreurs
- [ ] Ajouter le loading state
- [ ] Implémenter le filtrage (optionnel)
- [ ] Implémenter le tri (optionnel)
- [ ] Implémenter la pagination (optionnel)
- [ ] Tester avec différents scénarios (pas de données, erreur API, etc.)

---

**Dernière mise à jour :** 27 novembre 2025


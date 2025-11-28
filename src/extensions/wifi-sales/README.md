# Extension Bilan des Ventes Wi-Fi

Cette extension permet de suivre et d'analyser les ventes de tickets Wi-Fi.

## Structure du projet

```
wifi-sales/
├── components/        # Composants React de l'extension
├── hooks/             # Hooks personnalisés
├── types/             # Définitions de types TypeScript
├── utils/             # Fonctions utilitaires
├── index.tsx          # Point d'entrée de l'extension
└── manifest.json      # Manifeste de l'extension
```

## Fonctionnalités

1. **Formulaire de saisie** : Enregistrement des ventes de tickets Wi-Fi
2. **Statistiques en temps réel** : Calcul automatique des totaux hebdomadaires
3. **Historique des ventes** : Visualisation de toutes les ventes passées
4. **Graphiques de performance** : Analyse des tendances de vente
5. **Stockage local** : Persistance des données dans le navigateur

## Utilisation

1. Accédez à l'extension via le menu "Extensions" de l'application
2. Utilisez le formulaire pour enregistrer les ventes quotidiennes
3. Consultez les statistiques en temps réel
4. Analysez les performances grâce aux graphiques

## Technologies

- React avec TypeScript
- Hooks personnalisés pour la gestion d'état
- LocalStorage pour le stockage des données
- Composants UI réutilisables
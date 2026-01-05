# Calculateur d'Algèbre Relationnelle

Une application web interactive pour effectuer des opérations d'algèbre relationnelle sur des bases de données.

## 📋 Description

Ce calculateur permet d'exécuter et de visualiser les opérations fondamentales de l'algèbre relationnelle, un outil essentiel pour la manipulation et l'interrogation de bases de données relationnelles.

## ✨ Fonctionnalités

- ✅ **Opérations de base** : Sélection (σ), Projection (π), Union (∪), Intersection (∩), Différence (-)
- ✅ **Opérations avancées** : Produit cartésien (×), Jointure (⨝), Division (÷)
- ✅ **Interface intuitive** : Saisie et visualisation facile des relations
- ✅ **Résultats en temps réel** : Affichage instantané des résultats
- ✅ **Validation des requêtes** : Vérification de la syntaxe des opérations
- ✅ **Exemples pré-définis** : Pour faciliter la prise en main

## 🚀 Démarrage rapide

### Prérequis

- Node.js (version 14 ou supérieure)
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone https://github.com/votre-username/relational-algebra-calculator.git

# Accéder au dossier
cd relational-algebra-calculator

# Installer les dépendances
npm install

# Lancer l'application
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 🎯 Utilisation

### Exemple de requête
```
R1 = {(1, 'Alice'), (2, 'Bob'), (3, 'Charlie')}
R2 = {(1, 25), (2, 30), (3, 35)}

σ age > 25 (R2)
π nom (R1)
R1 ⨝ R2
```

### Syntaxe des opérations

| Opération | Symbole | Syntaxe |
|-----------|---------|---------|
| Sélection | σ | `σ condition (Relation)` |
| Projection | π | `π attributs (Relation)` |
| Union | ∪ | `R1 ∪ R2` |
| Intersection | ∩ | `R1 ∩ R2` |
| Différence | - | `R1 - R2` |
| Produit cartésien | × | `R1 × R2` |
| Jointure | ⨝ | `R1 ⨝ R2` |

## 🛠️ Technologies utilisées

- **Frontend** : React.js / Vue.js / HTML/CSS/JavaScript
- **Styling** : Tailwind CSS / Bootstrap
- **Parser** : Pour l'analyse syntaxique des requêtes
- **Visualisation** : Affichage des tables sous forme de grilles

## 📂 Structure du projet
```
relational-algebra-calculator/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Calculator.js
│   │   ├── TableDisplay.js
│   │   └── QueryInput.js
│   ├── utils/
│   │   ├── parser.js
│   │   └── operations.js
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## 🎓 Cas d'usage

- **Étudiants** : Apprentissage et pratique de l'algèbre relationnelle
- **Enseignants** : Outil pédagogique pour illustrer les concepts
- **Développeurs** : Prototypage rapide de requêtes relationnelles

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Roadmap

- [ ] Support des requêtes SQL en parallèle
- [ ] Export des résultats en CSV/JSON
- [ ] Mode sombre
- [ ] Historique des requêtes
- [ ] Sauvegarde des relations

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👤 Auteur

**BTS FES**
- GitHub: (https://github.com/btsfes)
- LinkedIn: (https://linkedin.com/in/btsfes)

## 🙏 Remerciements

- Inspiration tirée des cours de bases de données
- Communauté open source pour les outils et bibliothèques

---

⭐ Si ce projet vous a été utile, n'hésitez pas à lui donner une étoile !

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 21 mai 2026 à 22:10
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `sdmaa`
--

-- --------------------------------------------------------

--
-- Structure de la table `abonnement`
--

CREATE TABLE `abonnement` (
  `id_abonnement` bigint(20) NOT NULL,
  `age_max` int(11) NOT NULL,
  `age_min` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `nom` varchar(255) NOT NULL,
  `prix_annuel` decimal(8,2) NOT NULL,
  `prix_mensuel` decimal(8,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `abonnement`
--

INSERT INTO `abonnement` (`id_abonnement`, `age_max`, `age_min`, `description`, `nom`, `prix_annuel`, `prix_mensuel`) VALUES
(1, 5, 3, 'Offre pour les enfants de 3 à 5 ans', 'Baby', 250.00, 25.00),
(2, 12, 6, 'Offre pour les enfants de 6 à 12 ans', 'Enfants', 350.00, 35.00),
(3, 99, 13, 'Offre pour les 13 ans et plus', 'Ado/Adultes', 400.00, 40.00);

-- --------------------------------------------------------

--
-- Structure de la table `achat_equipement`
--

CREATE TABLE `achat_equipement` (
  `id_achat` bigint(20) NOT NULL,
  `date_achat` date NOT NULL,
  `mode_paiement` varchar(255) NOT NULL,
  `montant_total` decimal(8,2) NOT NULL,
  `quantite` int(11) NOT NULL,
  `statut_paiement` varchar(255) NOT NULL,
  `id_equipement` bigint(20) NOT NULL,
  `id_utilisateur` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `achat_equipement`
--

INSERT INTO `achat_equipement` (`id_achat`, `date_achat`, `mode_paiement`, `montant_total`, `quantite`, `statut_paiement`, `id_equipement`, `id_utilisateur`) VALUES
(1, '2026-04-23', 'especes', 100.00, 2, 'paye', 1, 2);

-- --------------------------------------------------------

--
-- Structure de la table `activite`
--

CREATE TABLE `activite` (
  `id_activite` bigint(20) NOT NULL,
  `capacite_max` int(11) DEFAULT NULL,
  `date_activite` date NOT NULL,
  `description` text DEFAULT NULL,
  `heure_debut` time(6) DEFAULT NULL,
  `heure_fin` time(6) DEFAULT NULL,
  `is_internal` bit(1) NOT NULL,
  `lien_externe` varchar(255) DEFAULT NULL,
  `lieu` varchar(255) NOT NULL,
  `prix` decimal(8,2) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `type_activite` varchar(255) NOT NULL,
  `categorie` varchar(255) NOT NULL,
  `discipline` varchar(255) NOT NULL,
  `duree_activite` varchar(255) NOT NULL,
  `image_activite` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `activite`
--

INSERT INTO `activite` (`id_activite`, `capacite_max`, `date_activite`, `description`, `heure_debut`, `heure_fin`, `is_internal`, `lien_externe`, `lieu`, `prix`, `titre`, `type_activite`, `categorie`, `discipline`, `duree_activite`, `image_activite`) VALUES
(1, 30, '2026-05-10', 'Session technique et combat', '19:00:00.000000', '21:00:00.000000', b'1', '', 'Dojo', 0.00, 'Entraînement des club', 'stage', '', 'Poomsea', '2 jours', 'http://localhost:8080/uploads/activite/poomse.jpg'),
(2, 100, '2026-07-25', 'Stage externe avec intervenant', '09:00:00.000000', '17:00:00.000000', b'0', 'https://example.com', 'Paris', 25.00, 'Stage de perfectionnement', 'competition', '', '', '', ''),
(3, 300, '2026-05-15', 'Compétition toutes catégories d\'ile de france', '09:00:00.000000', '17:00:00.000000', b'0', 'https://www.taekwondo-idf.com/fr/3/id/445', 'Saint-Denis', 60.00, 'Coupe IDF', 'COMPETITION', '-57kg Homme', 'Kyorugi', '', ''),
(4, 30, '2026-05-02', 'Perctionnement du grand ecart droit, gauche et facial', NULL, NULL, b'0', '', 'Gymnase des Francs-moisins', 35.00, 'SDMAA étirement', 'stage', 'Toutes', '', '1 jour', 'https://images.unsplash.com/photo-1771909718960-7fab338a09d3?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');

-- --------------------------------------------------------

--
-- Structure de la table `adhesion`
--

CREATE TABLE `adhesion` (
  `id_adhesion` bigint(20) NOT NULL,
  `date_debut` date DEFAULT NULL,
  `date_demande` date NOT NULL,
  `date_fin` date DEFAULT NULL,
  `date_validation_admin` date DEFAULT NULL,
  `mode_paiement` varchar(255) NOT NULL,
  `statut_adhesion` varchar(255) NOT NULL,
  `statut_paiement` varchar(255) NOT NULL,
  `id_abonnement` bigint(20) NOT NULL,
  `id_utilisateur` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `adhesion`
--

INSERT INTO `adhesion` (`id_adhesion`, `date_debut`, `date_demande`, `date_fin`, `date_validation_admin`, `mode_paiement`, `statut_adhesion`, `statut_paiement`, `id_abonnement`, `id_utilisateur`) VALUES
(3, '2026-04-25', '2026-04-25', '2027-04-25', '2026-04-25', 'especes', 'validee', 'paye', 2, 3);

-- --------------------------------------------------------

--
-- Structure de la table `affectation_cours`
--

CREATE TABLE `affectation_cours` (
  `id_affectation` bigint(20) NOT NULL,
  `commentaire` varchar(255) DEFAULT NULL,
  `date_affectation` datetime(6) DEFAULT NULL,
  `date_confirmation` datetime(6) DEFAULT NULL,
  `statut_affectation` varchar(255) NOT NULL,
  `id_coach` bigint(20) NOT NULL,
  `id_cours` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `affectation_cours`
--

INSERT INTO `affectation_cours` (`id_affectation`, `commentaire`, `date_affectation`, `date_confirmation`, `statut_affectation`, `id_coach`, `id_cours`) VALUES
(1, NULL, '2026-04-26 04:59:53.000000', '2026-04-26 05:12:32.000000', 'confirmee', 4, 1),
(2, NULL, '2026-04-27 04:48:26.000000', '2026-04-27 04:50:50.000000', 'confirmee', 4, 2);

-- --------------------------------------------------------

--
-- Structure de la table `annonce_cours`
--

CREATE TABLE `annonce_cours` (
  `id_annonce` bigint(20) NOT NULL,
  `date_concernee` date NOT NULL,
  `date_creation` datetime(6) NOT NULL,
  `message` text NOT NULL,
  `type_annonce` varchar(255) NOT NULL,
  `id_cours` bigint(20) NOT NULL,
  `jour_concerne` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `annonce_cours`
--

INSERT INTO `annonce_cours` (`id_annonce`, `date_concernee`, `date_creation`, `message`, `type_annonce`, `id_cours`, `jour_concerne`) VALUES
(6, '2026-05-20', '2026-05-10 07:40:04.000000', 'Le cours prévu à 18h est reporté à 19h. Désolé pour la gène occasionnée. Merci', 'REPORT', 2, 'Mercredi');

-- --------------------------------------------------------

--
-- Structure de la table `ceinture`
--

CREATE TABLE `ceinture` (
  `id_ceinture` bigint(20) NOT NULL,
  `couleur` varchar(255) NOT NULL,
  `nom` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `ceinture`
--

INSERT INTO `ceinture` (`id_ceinture`, `couleur`, `nom`) VALUES
(1, '#ef4444', 'Rouge'),
(2, '#000000', 'noire');

-- --------------------------------------------------------

--
-- Structure de la table `cours`
--

CREATE TABLE `cours` (
  `id_cours` bigint(20) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `heure_debut` time(6) NOT NULL,
  `heure_fin` time(6) NOT NULL,
  `jour` varchar(255) NOT NULL,
  `lieu` varchar(255) NOT NULL,
  `niveau` varchar(255) DEFAULT NULL,
  `statut_cours` varchar(255) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `tranche_age` varchar(255) DEFAULT NULL,
  `coach_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `cours`
--

INSERT INTO `cours` (`id_cours`, `description`, `heure_debut`, `heure_fin`, `jour`, `lieu`, `niveau`, `statut_cours`, `titre`, `tranche_age`, `coach_id`) VALUES
(1, 'Cours combat pour adultes', '18:00:00.000000', '20:30:00.000000', 'Lundi', 'Stade de France annexe', 'Intermédiaire, Avancé, Débutant', 'actif', 'Taekwondo Adultes', '16+', NULL),
(2, 'Cours technique et poomsea', '18:30:00.000000', '19:45:00.000000', 'Mercredi', 'Gymnase des francs-Moisin', 'Tous', 'actif', 'Taekwondo Enfants', '6-12', NULL),
(3, 'Cours ludique et technique pour enfants', '18:30:00.000000', '19:45:00.000000', 'Mardi', 'Gymnase des Francs-Moisins', 'Tous', 'actif', 'Taekwondo Enfants', '6-12', NULL),
(4, 'Cours technique pour enfants', '14:30:00.000000', '15:45:00.000000', 'Samedi', 'Gymnase des Francs-Moisins', 'Tous', 'actif', 'Taekwondo Enfants', '6-12', NULL),
(5, 'Cours ludique pour les baby', '13:30:00.000000', '14:15:00.000000', 'Samedi', 'Gymnase des Francs-Moisins', 'Tous', 'actif', 'Baby Taekwondo', '3-5', NULL),
(6, 'Cours ludique pour les baby', '18:30:00.000000', '19:15:00.000000', 'Mercredi', 'Gymnase des Francs-Moisins', 'Tous', 'actif', 'Baby Taekwondo', '3-5', NULL),
(7, 'Cours technique et combats', '19:30:00.000000', '20:45:00.000000', 'Mardi', 'Gymnase des Francs-Moisins', 'Tous', 'actif', 'Taekwondo Ado/Adultes', '16+', NULL),
(8, 'Cours technique et Poomsea', '19:30:00.000000', '20:45:00.000000', 'Mercredi', 'Gymnase des Francs-Moisins', 'Tous', 'actif', 'Taekwondo Ado/Adultes', '16+', NULL),
(9, 'Cours condition physique et compétition', '19:30:00.000000', '20:45:00.000000', 'Vendredi', 'Gymnase des Francs-Moisins', 'Compétiteurs', 'actif', 'Taekwondo Ado/Adultes', '16+', NULL),
(10, 'Cours condition physique et compétition', '15:30:00.000000', '16:45:00.000000', 'Samedi', 'Gymnase des Francs-Moisins', 'Tous', 'suspendu', 'Taekwondo Ado/Adultes', '16+', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `cours_abonnement`
--

CREATE TABLE `cours_abonnement` (
  `id_cours_abonnement` bigint(20) NOT NULL,
  `id_abonnement` bigint(20) NOT NULL,
  `id_cours` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `cours_abonnement`
--

INSERT INTO `cours_abonnement` (`id_cours_abonnement`, `id_abonnement`, `id_cours`) VALUES
(2, 2, 1),
(1, 3, 1),
(5, 2, 2),
(6, 2, 3),
(7, 2, 4),
(3, 1, 5),
(4, 1, 6),
(8, 3, 7),
(9, 3, 8),
(10, 3, 9),
(11, 3, 10);

-- --------------------------------------------------------

--
-- Structure de la table `document`
--

CREATE TABLE `document` (
  `id_document` bigint(20) NOT NULL,
  `date_upload` date NOT NULL,
  `est_valide` bit(1) DEFAULT NULL,
  `nom` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `id_activite` bigint(20) DEFAULT NULL,
  `id_utilisateur` bigint(20) NOT NULL,
  `fichier_url` varchar(255) NOT NULL,
  `date_expiration` date NOT NULL DEFAULT (CURRENT_DATE)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `document`
--

INSERT INTO `document` (`id_document`, `date_upload`, `est_valide`, `nom`, `type`, `id_activite`, `id_utilisateur`, `fichier_url`, `date_expiration`) VALUES
(1, '2026-04-23', b'0', 'Certificat médical 2026', 'certificat_medical', NULL, 2, '', '2026-05-04'),
(2, '2026-04-23', b'0', 'Attestation stage', 'attestation_stage', 2, 2, '', '2026-05-04');

-- --------------------------------------------------------

--
-- Structure de la table `emprunt_equipement`
--

CREATE TABLE `emprunt_equipement` (
  `id_emprunt` bigint(20) NOT NULL,
  `date_emprunt` date NOT NULL,
  `date_retour_effective` date DEFAULT NULL,
  `date_retour_prevue` date NOT NULL,
  `quantite` int(11) NOT NULL,
  `statut_emprunt` varchar(255) NOT NULL,
  `id_equipement` bigint(20) NOT NULL,
  `id_utilisateur` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `equipement`
--

CREATE TABLE `equipement` (
  `id_equipement` bigint(20) NOT NULL,
  `achetable` bit(1) NOT NULL,
  `empruntable` bit(1) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `prix_achat` decimal(8,2) DEFAULT NULL,
  `quantite_disponible` int(11) NOT NULL,
  `taille` varchar(255) DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `lien_image` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `categorie` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `equipement`
--

INSERT INTO `equipement` (`id_equipement`, `achetable`, `empruntable`, `nom`, `prix_achat`, `quantite_disponible`, `taille`, `type`, `lien_image`, `description`, `categorie`) VALUES
(1, b'1', b'1', 'Dobok Adulte', 50.00, 3, 'M', 'tenue', 'http://localhost:8080/uploads/equipements/dobok.jpg', 'Dobok à cole noire', 'Dobok'),
(2, b'0', b'1', 'Plastron', 85.00, 2, 'L', 'protection', 'http://localhost:8080/uploads/equipements/plastron.jpg', '', 'Plastron'),
(3, b'1', b'0', 'Ceinture', 20.00, 6, '3M', '', 'http://localhost:8080/uploads/equipements/ceinture.jpg\r\n', 'Ceinture noire en coton pur', 'Ceinture'),
(5, b'0', b'1', 'Protege Tibia', 0.00, 2, 'XL', 'Protection', 'http://localhost:8080/uploads/equipements/protegeTibia.jpg', 'Protege tibia Kwon', 'Protection');

-- --------------------------------------------------------

--
-- Structure de la table `inscription_activite`
--

CREATE TABLE `inscription_activite` (
  `id_inscription` bigint(20) NOT NULL,
  `commentaire` text DEFAULT NULL,
  `date_demande` date NOT NULL,
  `date_validation_admin` date DEFAULT NULL,
  `mode_paiement` varchar(255) DEFAULT NULL,
  `statut_inscription` varchar(255) NOT NULL,
  `statut_paiement` varchar(255) NOT NULL,
  `id_activite` bigint(20) NOT NULL,
  `id_utilisateur` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `inscription_activite`
--

INSERT INTO `inscription_activite` (`id_inscription`, `commentaire`, `date_demande`, `date_validation_admin`, `mode_paiement`, `statut_inscription`, `statut_paiement`, `id_activite`, `id_utilisateur`) VALUES
(1, 'Je souhaite participer', '2026-04-23', '2026-04-23', NULL, 'validee', 'non_requis', 1, 2),
(3, 'Je souhaite participer', '2026-04-23', NULL, 'especes', 'en_attente', 'en_attente', 2, 2);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

CREATE TABLE `utilisateur` (
  `id_utilisateur` bigint(20) NOT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `date_creation` datetime(6) DEFAULT NULL,
  `date_naissance` date DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `mot_de_passe` varchar(255) DEFAULT NULL,
  `nom` varchar(255) DEFAULT NULL,
  `prenom` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `statut_compte` varchar(255) DEFAULT NULL,
  `telephone` varchar(255) DEFAULT NULL,
  `id_ceinture` bigint(20) DEFAULT NULL,
  `mot_de_passe_hash` varchar(255) NOT NULL,
  `date_creation_compte` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateur`
--

INSERT INTO `utilisateur` (`id_utilisateur`, `adresse`, `date_creation`, `date_naissance`, `email`, `mot_de_passe`, `nom`, `prenom`, `role`, `statut_compte`, `telephone`, `id_ceinture`, `mot_de_passe_hash`, `date_creation_compte`) VALUES
(2, NULL, '2026-04-23 11:30:19.000000', NULL, 'admin@sdmaa.com', '123456', 'Gatsoni', 'Chancel', 'ADMIN', 'actif', NULL, 1, '$2a$10$VfjTK8EthHLnZcU32Tb2UesNE3/95DPmUHwnlgAc5Er1/Unvg1.3u', '2026-04-24 00:22:31'),
(3, '5, Rue Duprieuré Villiers-le-bel 95402', NULL, '2000-01-01', 'samba@mail.com', NULL, 'Samba', 'Roméo', 'ADHERENT', 'actif', '0601020307', 1, '$2a$10$.vgG44ZpkxcyK/ZQx0ywBeGqq6NUowVLFknrgSq9D6dn6HS1QIqk2', '2026-04-24 00:22:42'),
(4, 'Melun', NULL, '2000-01-01', 'nganga@sdmaa.com', NULL, 'Nganga', 'Dorian', 'COACH', 'actif', '0601020304', NULL, '$2a$10$IJamCSFSKLqVxoFBPF5x9O96Txqe/I4OT5eNFJRjOXFPXYjm2GjUO', '2026-04-26 04:55:10');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `abonnement`
--
ALTER TABLE `abonnement`
  ADD PRIMARY KEY (`id_abonnement`),
  ADD UNIQUE KEY `UK1yu0xufi7pu3mvlpmsd8yuw9v` (`nom`);

--
-- Index pour la table `achat_equipement`
--
ALTER TABLE `achat_equipement`
  ADD PRIMARY KEY (`id_achat`),
  ADD KEY `FKjjs96ldt57hmvbu98ypddcxse` (`id_equipement`),
  ADD KEY `FKjckwqd5js7mym1mli5s8ysl9l` (`id_utilisateur`);

--
-- Index pour la table `activite`
--
ALTER TABLE `activite`
  ADD PRIMARY KEY (`id_activite`);

--
-- Index pour la table `adhesion`
--
ALTER TABLE `adhesion`
  ADD PRIMARY KEY (`id_adhesion`),
  ADD KEY `FKn8gb2hh7t4xbmdhyq3ncst1ii` (`id_abonnement`),
  ADD KEY `FKfqnc9xulmaovlfv4ce0bx51ao` (`id_utilisateur`);

--
-- Index pour la table `affectation_cours`
--
ALTER TABLE `affectation_cours`
  ADD PRIMARY KEY (`id_affectation`),
  ADD UNIQUE KEY `UKrf3w2824ir64tvoefw4qaq7xq` (`id_coach`,`id_cours`),
  ADD KEY `FKsa3v8o8se31qtqhkj4jdwvl8v` (`id_cours`);

--
-- Index pour la table `annonce_cours`
--
ALTER TABLE `annonce_cours`
  ADD PRIMARY KEY (`id_annonce`),
  ADD KEY `FKgmvwrxo6bg5b3eghimlmg47e` (`id_cours`);

--
-- Index pour la table `ceinture`
--
ALTER TABLE `ceinture`
  ADD PRIMARY KEY (`id_ceinture`),
  ADD UNIQUE KEY `UK7ce5mskwytyrd84d4ivp36krc` (`nom`);

--
-- Index pour la table `cours`
--
ALTER TABLE `cours`
  ADD PRIMARY KEY (`id_cours`),
  ADD KEY `FKp4urffa8udcelbstblml7eut5` (`coach_id`);

--
-- Index pour la table `cours_abonnement`
--
ALTER TABLE `cours_abonnement`
  ADD PRIMARY KEY (`id_cours_abonnement`),
  ADD UNIQUE KEY `UKa6gwirrjqqp0ivqdvr71sj7qg` (`id_cours`,`id_abonnement`),
  ADD KEY `FK9yfcf5tc3aeebpm2x8yl3l2am` (`id_abonnement`);

--
-- Index pour la table `document`
--
ALTER TABLE `document`
  ADD PRIMARY KEY (`id_document`),
  ADD KEY `FKc97javaxjphh1s9joh98xk6x7` (`id_activite`),
  ADD KEY `FKw7nu6jbbs1yl0v2p7mwrdycr` (`id_utilisateur`);

--
-- Index pour la table `emprunt_equipement`
--
ALTER TABLE `emprunt_equipement`
  ADD PRIMARY KEY (`id_emprunt`),
  ADD KEY `FKfka9jnue5ehvtruidmex8xbk4` (`id_equipement`),
  ADD KEY `FK98shh1fjdfcpx5ukdawey7cje` (`id_utilisateur`);

--
-- Index pour la table `equipement`
--
ALTER TABLE `equipement`
  ADD PRIMARY KEY (`id_equipement`);

--
-- Index pour la table `inscription_activite`
--
ALTER TABLE `inscription_activite`
  ADD PRIMARY KEY (`id_inscription`),
  ADD UNIQUE KEY `uk_utilisateur_activite` (`id_utilisateur`,`id_activite`),
  ADD UNIQUE KEY `UKeymdiq4bxdimndnekgs7j2dxw` (`id_utilisateur`,`id_activite`),
  ADD KEY `FKfhu30od24ubcy4aty582c0oqu` (`id_activite`);

--
-- Index pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD PRIMARY KEY (`id_utilisateur`),
  ADD UNIQUE KEY `UKrma38wvnqfaf66vvmi57c71lo` (`email`),
  ADD KEY `FKn01sxyhjescmypsm4gw6m22ok` (`id_ceinture`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `abonnement`
--
ALTER TABLE `abonnement`
  MODIFY `id_abonnement` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `achat_equipement`
--
ALTER TABLE `achat_equipement`
  MODIFY `id_achat` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `activite`
--
ALTER TABLE `activite`
  MODIFY `id_activite` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `adhesion`
--
ALTER TABLE `adhesion`
  MODIFY `id_adhesion` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `affectation_cours`
--
ALTER TABLE `affectation_cours`
  MODIFY `id_affectation` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `annonce_cours`
--
ALTER TABLE `annonce_cours`
  MODIFY `id_annonce` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `ceinture`
--
ALTER TABLE `ceinture`
  MODIFY `id_ceinture` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `cours`
--
ALTER TABLE `cours`
  MODIFY `id_cours` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `cours_abonnement`
--
ALTER TABLE `cours_abonnement`
  MODIFY `id_cours_abonnement` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `document`
--
ALTER TABLE `document`
  MODIFY `id_document` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `emprunt_equipement`
--
ALTER TABLE `emprunt_equipement`
  MODIFY `id_emprunt` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `equipement`
--
ALTER TABLE `equipement`
  MODIFY `id_equipement` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `inscription_activite`
--
ALTER TABLE `inscription_activite`
  MODIFY `id_inscription` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `id_utilisateur` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `achat_equipement`
--
ALTER TABLE `achat_equipement`
  ADD CONSTRAINT `FKjckwqd5js7mym1mli5s8ysl9l` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id_utilisateur`),
  ADD CONSTRAINT `FKjjs96ldt57hmvbu98ypddcxse` FOREIGN KEY (`id_equipement`) REFERENCES `equipement` (`id_equipement`);

--
-- Contraintes pour la table `adhesion`
--
ALTER TABLE `adhesion`
  ADD CONSTRAINT `FKfqnc9xulmaovlfv4ce0bx51ao` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id_utilisateur`),
  ADD CONSTRAINT `FKn8gb2hh7t4xbmdhyq3ncst1ii` FOREIGN KEY (`id_abonnement`) REFERENCES `abonnement` (`id_abonnement`);

--
-- Contraintes pour la table `affectation_cours`
--
ALTER TABLE `affectation_cours`
  ADD CONSTRAINT `FKqteau6kiqt01wsy3whjwcbs1m` FOREIGN KEY (`id_coach`) REFERENCES `utilisateur` (`id_utilisateur`),
  ADD CONSTRAINT `FKsa3v8o8se31qtqhkj4jdwvl8v` FOREIGN KEY (`id_cours`) REFERENCES `cours` (`id_cours`);

--
-- Contraintes pour la table `annonce_cours`
--
ALTER TABLE `annonce_cours`
  ADD CONSTRAINT `FKgmvwrxo6bg5b3eghimlmg47e` FOREIGN KEY (`id_cours`) REFERENCES `cours` (`id_cours`);

--
-- Contraintes pour la table `cours`
--
ALTER TABLE `cours`
  ADD CONSTRAINT `FKp4urffa8udcelbstblml7eut5` FOREIGN KEY (`coach_id`) REFERENCES `utilisateur` (`id_utilisateur`);

--
-- Contraintes pour la table `cours_abonnement`
--
ALTER TABLE `cours_abonnement`
  ADD CONSTRAINT `FK9yfcf5tc3aeebpm2x8yl3l2am` FOREIGN KEY (`id_abonnement`) REFERENCES `abonnement` (`id_abonnement`),
  ADD CONSTRAINT `FKbh3ebe28kh47hfc0x25mseu87` FOREIGN KEY (`id_cours`) REFERENCES `cours` (`id_cours`);

--
-- Contraintes pour la table `document`
--
ALTER TABLE `document`
  ADD CONSTRAINT `FKc97javaxjphh1s9joh98xk6x7` FOREIGN KEY (`id_activite`) REFERENCES `activite` (`id_activite`),
  ADD CONSTRAINT `FKw7nu6jbbs1yl0v2p7mwrdycr` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id_utilisateur`);

--
-- Contraintes pour la table `emprunt_equipement`
--
ALTER TABLE `emprunt_equipement`
  ADD CONSTRAINT `FK98shh1fjdfcpx5ukdawey7cje` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id_utilisateur`),
  ADD CONSTRAINT `FKfka9jnue5ehvtruidmex8xbk4` FOREIGN KEY (`id_equipement`) REFERENCES `equipement` (`id_equipement`);

--
-- Contraintes pour la table `inscription_activite`
--
ALTER TABLE `inscription_activite`
  ADD CONSTRAINT `FKfhu30od24ubcy4aty582c0oqu` FOREIGN KEY (`id_activite`) REFERENCES `activite` (`id_activite`),
  ADD CONSTRAINT `FKpns43mywim0ujbncsat02183y` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id_utilisateur`);

--
-- Contraintes pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD CONSTRAINT `FKn01sxyhjescmypsm4gw6m22ok` FOREIGN KEY (`id_ceinture`) REFERENCES `ceinture` (`id_ceinture`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

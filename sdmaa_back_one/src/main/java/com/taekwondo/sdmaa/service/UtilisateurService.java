package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.ChangePasswordRequest;
import com.taekwondo.sdmaa.dto.ImageUploadResponse;
import com.taekwondo.sdmaa.dto.UpdateProfilRequest;
import com.taekwondo.sdmaa.dto.UtilisateurDTO;
import com.taekwondo.sdmaa.entity.Ceinture;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.exception.BusinessException;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.UtilisateurMapper;
import com.taekwondo.sdmaa.repository.CeintureRepository;
import com.taekwondo.sdmaa.repository.UtilisateurRepository;
import com.taekwondo.sdmaa.security.XssSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UtilisateurService {

    private final UtilisateurRepository repository;
    private final CeintureRepository ceintureRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryImageService cloudinaryImageService;
    private static final String DOSSIER_PROFILS =
            "sdmaa/profils";

    /**
     * Créer un utilisateur.
     */
    public Utilisateur create(Utilisateur user) {

        sanitizeUtilisateur(user);

        if (repository.existsByEmail(user.getEmail())) {
            throw new BusinessException(
                    "Un utilisateur avec cette adresse email existe déjà"
            );
        }

        user.setStatutCompte("en_attente");
        user.setRole("ADHERENT");

        if (user.getDateCreationCompte() == null) {
            user.setDateCreationCompte(LocalDateTime.now());
        }

        if (user.getMotDePasseHash() == null
                || user.getMotDePasseHash().isBlank()) {
            throw new BusinessException(
                    "Le mot de passe est obligatoire"
            );
        }

        user.setMotDePasseHash(
                passwordEncoder.encode(
                        user.getMotDePasseHash()
                )
        );

        return repository.save(user);
    }

    /**
     * Récupérer tous les utilisateurs.
     */
    public List<UtilisateurDTO> getAll() {

        return repository.findAll()
                .stream()
                .map(UtilisateurMapper::toDTO)
                .toList();
    }

    /**
     * Récupérer un utilisateur par son identifiant.
     */
    public UtilisateurDTO getById(Long id) {

        return UtilisateurMapper.toDTO(
                getEntityById(id)
        );
    }

    /**
     * Récupérer l'entité Utilisateur par son identifiant.
     */
    public Utilisateur getEntityById(Long id) {

        return repository.findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Utilisateur non trouvé"
                        )
                );
    }

    /**
     * Modification générale d'un utilisateur.
     */
    public Utilisateur update(
            Long id,
            Utilisateur updatedUser
    ) {

        Utilisateur user = getEntityById(id);

        if (updatedUser.getNom() != null) {
            user.setNom(
                    XssSanitizer.clean(
                            updatedUser.getNom().trim()
                    )
            );
        }

        if (updatedUser.getPrenom() != null) {
            user.setPrenom(
                    XssSanitizer.clean(
                            updatedUser.getPrenom().trim()
                    )
            );
        }

        if (updatedUser.getEmail() != null) {

            String nouvelEmail = XssSanitizer.clean(
                    updatedUser.getEmail().trim().toLowerCase()
            );

            boolean emailModifie =
                    !nouvelEmail.equalsIgnoreCase(
                            user.getEmail()
                    );

            if (emailModifie
                    && repository.existsByEmail(nouvelEmail)) {
                throw new BusinessException(
                        "Cette adresse email est déjà utilisée"
                );
            }

            user.setEmail(nouvelEmail);
        }

        if (updatedUser.getTelephone() != null) {
            user.setTelephone(
                    XssSanitizer.clean(
                            updatedUser.getTelephone().trim()
                    )
            );
        }

        if (updatedUser.getAdresse() != null) {
            user.setAdresse(
                    XssSanitizer.clean(
                            updatedUser.getAdresse().trim()
                    )
            );
        }

        if (updatedUser.getDateNaissance() != null) {
            user.setDateNaissance(
                    updatedUser.getDateNaissance()
            );
        }

        return repository.save(user);
    }

    /**
     * Suspendre un utilisateur.
     */
    public void suspendre(Long id) {

        Utilisateur user = getEntityById(id);

        user.setStatutCompte("suspendu");

        repository.save(user);
    }

    /**
     * Récupérer l'utilisateur connecté grâce à son email JWT.
     */
    public Utilisateur getUtilisateurConnecte() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {
            throw new BusinessException(
                    "Aucun utilisateur authentifié"
            );
        }

        String email = authentication.getName();

        return repository.findByEmail(email)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Utilisateur connecté non trouvé"
                        )
                );
    }

    /**
     * Récupérer le profil de l'utilisateur connecté.
     */
    public UtilisateurDTO getMe() {

        return UtilisateurMapper.toDTO(
                getUtilisateurConnecte()
        );
    }

    /**
     * Attribuer une ceinture à un utilisateur.
     */
    public UtilisateurDTO assignerCeinture(
            Long idUtilisateur,
            Long idCeinture
    ) {

        Utilisateur utilisateur =
                getEntityById(idUtilisateur);

        Ceinture ceinture =
                ceintureRepository.findById(idCeinture)
                        .orElseThrow(
                                () -> new ResourceNotFoundException(
                                        "Ceinture non trouvée"
                                )
                        );

        utilisateur.setCeinture(ceinture);

        Utilisateur utilisateurEnregistre =
                repository.save(utilisateur);

        return UtilisateurMapper.toDTO(
                utilisateurEnregistre
        );
    }

    /**
     * Modifier les informations personnelles de l'utilisateur connecté.
     *
     * La date de naissance, le rôle, le statut du compte et la ceinture
     * ne sont volontairement pas modifiables depuis cette méthode.
     */
    public UtilisateurDTO updateMe(
            UpdateProfilRequest request
    ) {

        if (request == null) {
            throw new BusinessException(
                    "Les informations du profil sont obligatoires"
            );
        }

        Utilisateur utilisateur = getUtilisateurConnecte();

        String nomNettoye = XssSanitizer.clean(
                request.getNom().trim()
        );

        String prenomNettoye = XssSanitizer.clean(
                request.getPrenom().trim()
        );

        String emailNettoye = XssSanitizer.clean(
                request.getEmail().trim().toLowerCase()
        );

        boolean emailModifie =
                !emailNettoye.equalsIgnoreCase(utilisateur.getEmail());

        if (emailModifie && repository.existsByEmail(emailNettoye)) {
            throw new BusinessException(
                    "Cette adresse email est déjà utilisée"
            );
        }

        utilisateur.setNom(nomNettoye);
        utilisateur.setPrenom(prenomNettoye);
        utilisateur.setEmail(emailNettoye);
        utilisateur.setTelephone(cleanOptionalText(request.getTelephone()));
        utilisateur.setAdresse(cleanOptionalText(request.getAdresse()));

        Utilisateur utilisateurMisAJour = repository.save(utilisateur);

        return UtilisateurMapper.toDTO(utilisateurMisAJour);
    }

    /**
     * Nettoyer un champ facultatif.
     * Une chaîne vide est enregistrée sous la forme null.
     */
    private String cleanOptionalText(String value) {

        if (value == null || value.isBlank()) {
            return null;
        }

        return XssSanitizer.clean(value.trim());
    }

    /**
     * Modifier le mot de passe de l'utilisateur connecté.
     */
    public void changerMotDePasse(
            ChangePasswordRequest request
    ) {

        if (request == null) {
            throw new BusinessException(
                    "Les informations du mot de passe sont obligatoires"
            );
        }

        Utilisateur utilisateur =
                getUtilisateurConnecte();

        if (request.getAncienMotDePasse() == null
                || request.getAncienMotDePasse().isBlank()) {
            throw new BusinessException(
                    "L'ancien mot de passe est obligatoire"
            );
        }

        if (!passwordEncoder.matches(
                request.getAncienMotDePasse(),
                utilisateur.getMotDePasseHash()
        )) {
            throw new BusinessException(
                    "Ancien mot de passe incorrect"
            );
        }

        if (request.getNouveauMotDePasse() == null
                || request.getNouveauMotDePasse().length() < 13) {
            throw new BusinessException(
                    "Le nouveau mot de passe doit contenir au moins 13 caractères"
            );
        }

        if (!request.getNouveauMotDePasse().equals(
                request.getConfirmationMotDePasse()
        )) {
            throw new BusinessException(
                    "Les mots de passe ne correspondent pas"
            );
        }

        if (passwordEncoder.matches(
                request.getNouveauMotDePasse(),
                utilisateur.getMotDePasseHash()
        )) {
            throw new BusinessException(
                    "Le nouveau mot de passe doit être différent de l'ancien"
            );
        }

        utilisateur.setMotDePasseHash(
                passwordEncoder.encode(
                        request.getNouveauMotDePasse()
                )
        );

        repository.save(utilisateur);
    }

    /**
     * Modifier le profil d'un utilisateur depuis l'administration.
     */
    public UtilisateurDTO updateProfilByAdmin(
            Long id,
            Utilisateur updatedUser
    ) {

        if (updatedUser == null) {
            throw new BusinessException(
                    "Les informations de l'utilisateur sont obligatoires"
            );
        }

        Utilisateur user = getEntityById(id);

        if (updatedUser.getNom() != null
                && !updatedUser.getNom().isBlank()) {
            user.setNom(
                    XssSanitizer.clean(
                            updatedUser.getNom().trim()
                    )
            );
        }

        if (updatedUser.getPrenom() != null
                && !updatedUser.getPrenom().isBlank()) {
            user.setPrenom(
                    XssSanitizer.clean(
                            updatedUser.getPrenom().trim()
                    )
            );
        }

        if (updatedUser.getEmail() != null
                && !updatedUser.getEmail().isBlank()) {

            String nouvelEmail =
                    XssSanitizer.clean(
                            updatedUser
                                    .getEmail()
                                    .trim()
                                    .toLowerCase()
                    );

            boolean emailModifie =
                    !nouvelEmail.equalsIgnoreCase(
                            user.getEmail()
                    );

            if (emailModifie
                    && repository.existsByEmail(nouvelEmail)) {
                throw new BusinessException(
                        "Cette adresse email est déjà utilisée"
                );
            }

            user.setEmail(nouvelEmail);
        }

        if (updatedUser.getTelephone() != null) {
            user.setTelephone(
                    XssSanitizer.clean(
                            updatedUser.getTelephone().trim()
                    )
            );
        }

        if (updatedUser.getAdresse() != null) {
            user.setAdresse(
                    XssSanitizer.clean(
                            updatedUser.getAdresse().trim()
                    )
            );
        }

        if (updatedUser.getDateNaissance() != null) {
            user.setDateNaissance(
                    updatedUser.getDateNaissance()
            );
        }

        return UtilisateurMapper.toDTO(
                repository.save(user)
        );
    }

    /**
     * Modifier le rôle d'un utilisateur.
     */
    public UtilisateurDTO updateRole(
            Long id,
            String role
    ) {

        if (role == null || role.isBlank()) {
            throw new BusinessException(
                    "Le rôle est obligatoire"
            );
        }

        Utilisateur user = getEntityById(id);

        String normalizedRole =
                role.trim().toUpperCase();

        if (!List.of(
                "ADHERENT",
                "COACH",
                "ADMIN"
        ).contains(normalizedRole)) {
            throw new BusinessException(
                    "Rôle invalide"
            );
        }

        user.setRole(normalizedRole);

        return UtilisateurMapper.toDTO(
                repository.save(user)
        );
    }

    /**
     * Ajouter ou remplacer la photo de profil
     * de l'utilisateur connecté.
     */
    public ImageUploadResponse updateMyPhoto(
            MultipartFile photo
    ) {
        Utilisateur utilisateur =
                getUtilisateurConnecte();

        /*
         * On envoie d'abord la nouvelle photo.
         * Si l'upload échoue, l'ancienne reste disponible.
         */
        Map<String, String> resultat =
                cloudinaryImageService.uploader(
                        photo,
                        DOSSIER_PROFILS
                );

        String nouvelleUrl =
                resultat.get("url");

        String nouveauPublicId =
                resultat.get("publicId");

        String ancienPublicId =
                utilisateur.getPhotoPublicId();

        utilisateur.setPhotoUrl(nouvelleUrl);
        utilisateur.setPhotoPublicId(
                nouveauPublicId
        );

        repository.save(utilisateur);

        /*
         * On supprime l'ancienne photo uniquement
         * après avoir enregistré la nouvelle.
         */
        if (
                ancienPublicId != null
                        && !ancienPublicId.isBlank()
                        && !ancienPublicId.equals(
                        nouveauPublicId
                )
        ) {
            cloudinaryImageService.supprimer(
                    ancienPublicId
            );
        }

        return new ImageUploadResponse(
                nouveauPublicId,
                nouvelleUrl
        );
    }

    /**
     * Supprimer la photo de profil
     * de l'utilisateur connecté.
     */
    public void deleteMyPhoto() {
        Utilisateur utilisateur =
                getUtilisateurConnecte();

        String publicId =
                utilisateur.getPhotoPublicId();

        if (
                publicId != null
                        && !publicId.isBlank()
        ) {
            cloudinaryImageService.supprimer(
                    publicId
            );
        }

        utilisateur.setPhotoUrl(null);
        utilisateur.setPhotoPublicId(null);

        repository.save(utilisateur);
    }

    /**
     * Modifier le statut du compte.
     */
    public UtilisateurDTO updateStatutCompte(
            Long id,
            String statut
    ) {

        if (statut == null || statut.isBlank()) {
            throw new BusinessException(
                    "Le statut est obligatoire"
            );
        }

        Utilisateur user = getEntityById(id);

        String normalizedStatut =
                statut.trim().toLowerCase();

        if (!List.of(
                "en_attente",
                "actif",
                "suspendu",
                "refuse"
        ).contains(normalizedStatut)) {
            throw new BusinessException(
                    "Statut de compte invalide"
            );
        }

        user.setStatutCompte(normalizedStatut);

        return UtilisateurMapper.toDTO(
                repository.save(user)
        );
    }

    /**
     * Nettoyer les données textuelles avant enregistrement.
     */
    private void sanitizeUtilisateur(
            Utilisateur user
    ) {

        if (user.getNom() != null) {
            user.setNom(
                    XssSanitizer.clean(
                            user.getNom().trim()
                    )
            );
        }

        if (user.getPrenom() != null) {
            user.setPrenom(
                    XssSanitizer.clean(
                            user.getPrenom().trim()
                    )
            );
        }

        if (user.getEmail() != null) {
            user.setEmail(
                    XssSanitizer.clean(
                            user.getEmail()
                                    .trim()
                                    .toLowerCase()
                    )
            );
        }

        if (user.getTelephone() != null) {
            user.setTelephone(
                    XssSanitizer.clean(
                            user.getTelephone().trim()
                    )
            );
        }

        if (user.getAdresse() != null) {
            user.setAdresse(
                    XssSanitizer.clean(
                            user.getAdresse().trim()
                    )
            );
        }
    }
}
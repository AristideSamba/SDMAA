package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.DocumentDTO;
import com.taekwondo.sdmaa.entity.Activite;
import com.taekwondo.sdmaa.entity.Document;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.exception.BusinessException;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.DocumentMapper;
import com.taekwondo.sdmaa.repository.ActiviteRepository;
import com.taekwondo.sdmaa.repository.DocumentRepository;
import com.taekwondo.sdmaa.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ActiviteRepository activiteRepository;
    private final UtilisateurService utilisateurService;

    public Document create(Long idUtilisateur, Long idActivite, Document document) {

        Utilisateur utilisateur = utilisateurRepository.findById(idUtilisateur)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Activite activite = null;

        if (idActivite != null) {
            activite = activiteRepository.findById(idActivite)
                    .orElseThrow(() -> new ResourceNotFoundException("Activité non trouvée"));
        }

        document.setUtilisateur(utilisateur);
        document.setActivite(activite);
        document.setDateUpload(LocalDate.now());
        document.setEstValide(false);

        return documentRepository.save(document);
    }

    public List<DocumentDTO> getAll() {
        return documentRepository.findAll()
                .stream()
                .map(DocumentMapper::toDTO)
                .toList();
    }

    public List<DocumentDTO> getByUtilisateur(Long idUtilisateur) {
        return documentRepository.findByUtilisateurIdUtilisateur(idUtilisateur)
                .stream()
                .map(DocumentMapper::toDTO)
                .toList();
    }

    public List<DocumentDTO> getMyDocuments() {
        Utilisateur utilisateur = utilisateurService.getUtilisateurConnecte();

        return documentRepository
                .findByUtilisateurIdUtilisateur(utilisateur.getIdUtilisateur())
                .stream()
                .map(DocumentMapper::toDTO)
                .toList();
    }

    public DocumentDTO getById(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document non trouvé"));

        return DocumentMapper.toDTO(doc);
    }

    public Document valider(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document non trouvé"));

        doc.setEstValide(true);

        return documentRepository.save(doc);
    }

    public void delete(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document non trouvé"));

        documentRepository.delete(doc);
    }

    public DocumentDTO uploadForCurrentUser(
            MultipartFile file,
            String titre,
            String typeDocument,
            LocalDate dateExpiration
    ) {
        Utilisateur utilisateur = utilisateurService.getUtilisateurConnecte();

        if (file == null || file.isEmpty()) {
            throw new BusinessException("Le fichier est obligatoire");
        }

        try {
            String uploadDir = "uploads/documents/";
            Files.createDirectories(Paths.get(uploadDir));

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            Document document = Document.builder()
                    .titre(titre)
                    .type(typeDocument)
                    .urlFichier("/uploads/documents/" + fileName)
                    .dateUpload(LocalDate.now())
                    .dateExpiration(dateExpiration)
                    .estValide(true)
                    .utilisateur(utilisateur)
                    .build();

            return DocumentMapper.toDTO(documentRepository.save(document));

        } catch (IOException e) {
            throw new BusinessException("Erreur lors de l'envoi du fichier");
        }
    }
}

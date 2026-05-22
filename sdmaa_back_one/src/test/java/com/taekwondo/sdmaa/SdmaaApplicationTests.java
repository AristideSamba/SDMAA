package com.taekwondo.sdmaa;

import com.taekwondo.sdmaa.entity.Adhesion;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.exception.BusinessException;
import com.taekwondo.sdmaa.repository.AbonnementRepository;
import com.taekwondo.sdmaa.repository.AdhesionRepository;
import com.taekwondo.sdmaa.repository.UtilisateurRepository;
import com.taekwondo.sdmaa.service.AdhesionService;
import com.taekwondo.sdmaa.service.UtilisateurService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdhesionServiceTest {

	@Mock
	private AdhesionRepository adhesionRepository;

	@Mock
	private UtilisateurRepository utilisateurRepository;

	@Mock
	private AbonnementRepository abonnementRepository;

	@Mock
	private UtilisateurService utilisateurService;

	@InjectMocks
	private AdhesionService adhesionService;

	@Test
	void valider_devraitValiderAdhesionEtActiverUtilisateur() {
		Utilisateur utilisateur = Utilisateur.builder()
				.idUtilisateur(1L)
				.nom("Samba")
				.prenom("Aristide")
				.email("test@mail.com")
				.statutCompte("en_attente")
				.build();

		Adhesion adhesion = Adhesion.builder()
				.idAdhesion(10L)
				.utilisateur(utilisateur)
				.statutAdhesion("en_attente")
				.statutPaiement("en_attente")
				.build();

		when(adhesionRepository.findById(10L))
				.thenReturn(Optional.of(adhesion));

		when(adhesionRepository.save(any(Adhesion.class)))
				.thenAnswer(invocation -> invocation.getArgument(0));

		Adhesion result = adhesionService.valider(10L);

		assertEquals("validee", result.getStatutAdhesion());
		assertEquals("paye", result.getStatutPaiement());
		assertEquals("actif", utilisateur.getStatutCompte());

		assertEquals(LocalDate.now(), result.getDateValidationAdmin());
		assertEquals(LocalDate.now(), result.getDateDebut());
		assertEquals(LocalDate.now().plusYears(1), result.getDateFin());

		verify(utilisateurRepository).save(utilisateur);
		verify(adhesionRepository).save(adhesion);
	}

	@Test
	void valider_devraitRefuserSiAdhesionDejaTraitee() {
		Adhesion adhesion = Adhesion.builder()
				.idAdhesion(10L)
				.statutAdhesion("validee")
				.build();

		when(adhesionRepository.findById(10L))
				.thenReturn(Optional.of(adhesion));

		assertThrows(
				BusinessException.class,
				() -> adhesionService.valider(10L)
		);

		verify(adhesionRepository, never()).save(any());
		verify(utilisateurRepository, never()).save(any());
	}
}

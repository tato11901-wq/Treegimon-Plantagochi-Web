/**
 * plantSpriteRegistry.ts
 *
 * Registro centralizado de sprites por especie y fase.
 * Para añadir una especie nueva:
 *   1. Crea su carpeta en `src/assets/Recursos planta/Sprites <NombreEspecie>/`
 *   2. Añade sus 4 imágenes (seed, small_bush, large_bush, ent)
 *   3. Importa y registra la entrada aquí, sin tocar Plant.tsx
 */

import type { PlantPhase } from "../store/plantStore";

export interface SpriteConfig {
  src: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number; // 1 = imagen estática, >1 = spritesheet animado
  scale: number;
  hitbox: string;
}

// ─────────────────────────────────────────────
// PASTO  (Spritesheets animados)
// ─────────────────────────────────────────────
import pasto_seed from '../assets/Recursos planta/William Santiago Cubillos_Pasto/semilla_idle_spritesheet.png';
import pasto_small_bush from '../assets/Recursos planta/William Santiago Cubillos_Pasto/fase2_idle_spritesheet.png';
import pasto_large_bush from '../assets/Recursos planta/William Santiago Cubillos_Pasto/fase3_idle_spritesheet.png';
import pasto_ent from '../assets/Recursos planta/William Santiago Cubillos_Pasto/end_idle_spritesheet.png';

// ─────────────────────────────────────────────
// NOGAL  (Imágenes estáticas)
// ─────────────────────────────────────────────
import nogal_seed from '../assets/Recursos planta/Diego Martinez_Nogal/2D/Nogal_Diego_Martínez_Rodríguez_fase1_ss.png';
import nogal_small_bush from '../assets/Recursos planta/Diego Martinez_Nogal/2D/Nogal_Diego_Martínez_Rodríguez_fase2_ss.png';
import nogal_large_bush from '../assets/Recursos planta/Diego Martinez_Nogal/2D/Nogal_Diego_Martínez_Rodríguez_fase3_ss.png';
import nogal_ent from '../assets/Recursos planta/Diego Martinez_Nogal/2D/Nogal_Diego_Martínez_Rodríguez_fase4_ss.png';

// ─────────────────────────────────────────────
// CEDRO  (Imágenes estáticas)
// ─────────────────────────────────────────────
import cedro_seed from '../assets/Recursos planta/Juan Lombana_Cedro/2D/Cedro_Juan_Manuel_Lombana_Cárdenas_fase1_ss.png';
import cedro_small_bush from '../assets/Recursos planta/Juan Lombana_Cedro/2D/Cedro_Juan_Manuel_Lombana_Cárdenas_fase2_ss.png';
import cedro_large_bush from '../assets/Recursos planta/Juan Lombana_Cedro/2D/Cedro_Juan_Manuel_Lombana_Cárdenas_fase3_ss.png';
import cedro_ent from '../assets/Recursos planta/Juan Lombana_Cedro/2D/Cedro_Juan_Manuel_Lombana_Cárdenas_fase4_ss.png';

// ─────────────────────────────────────────────
// cajeto (Spritesheets animados)
// ─────────────────────────────────────────────
import cajeto_seed from '../assets/Recursos planta/William Santiago Cubillos Cajeto/2D/William Cubillos_Cajeto_fase1_ss.png';
import cajeto_small_bush from '../assets/Recursos planta/William Santiago Cubillos Cajeto/2D/William Cubillos_Cajeto_fase2_ss.png';
import cajeto_large_bush from '../assets/Recursos planta/William Santiago Cubillos Cajeto/2D/William Cubillos_Cajeto_fase3_ss.png';
import cajeto_ent from '../assets/Recursos planta/William Santiago Cubillos Cajeto/2D/William Cubillos_Cajeto_fase4_ss.png';

import carlos_correa_drago_seed from '../assets/Recursos planta/Carlos Correa_Drago/2D/Drago_Carlos_Ernesto_Correa_Rodríguez_fase1_ss.png';
import carlos_correa_drago_small_bush from '../assets/Recursos planta/Carlos Correa_Drago/2D/Drago_Carlos_Ernesto_Correa_Rodríguez_fase2_ss.png';
import carlos_correa_drago_large_bush from '../assets/Recursos planta/Carlos Correa_Drago/2D/Drago_Carlos_Ernesto_Correa_Rodríguez_fase3_ss.png';
import carlos_correa_drago_ent from '../assets/Recursos planta/Carlos Correa_Drago/2D/Drago_Carlos_Ernesto_Correa_Rodríguez_fase4_ss.png';

import jesica_pineros_drago_seed from '../assets/Recursos planta/Jesica Piñeros_Drago/2D/Drago_Jesica_Alejandra_Piñeros_Garcia_fase1_ss.png';
import jesica_pineros_drago_small_bush from '../assets/Recursos planta/Jesica Piñeros_Drago/2D/Drago_Jesica_Alejandra_Piñeros_Garcia_fase2_ss.png';
import jesica_pineros_drago_large_bush from '../assets/Recursos planta/Jesica Piñeros_Drago/2D/Drago_Jesica_Alejandra_Piñeros_Garcia_fase3_ss.png';
import jesica_pineros_drago_ent from '../assets/Recursos planta/Jesica Piñeros_Drago/2D/Drago_Jesica_Alejandra_Piñeros_Garcia_fase4_ss.png';

import adriana_espitia_drago_seed from '../assets/Recursos planta/Adriana Espitia_Drago/2D/Drago_Adriana_Sofia_Espitia_Contreras_fase1_ss.png';
import adriana_espitia_drago_small_bush from '../assets/Recursos planta/Adriana Espitia_Drago/2D/Drago_Adriana_Sofia_Espitia_Contreras_fase2_ss.png';
import adriana_espitia_drago_large_bush from '../assets/Recursos planta/Adriana Espitia_Drago/2D/Drago_Adriana_Sofia_Espitia_Contreras_fase3_ss.png';
import adriana_espitia_drago_ent from '../assets/Recursos planta/Adriana Espitia_Drago/2D/Drago_Adriana_Sofia_Espitia_Contreras_fase4_ss.png';

import alejandro_ramirez_drago_seed from '../assets/Recursos planta/Alejandro Ramirez_Drago/2D/Drago_Alejandro_Ramirez_Velasquez_fase1_ss.png';
import alejandro_ramirez_drago_small_bush from '../assets/Recursos planta/Alejandro Ramirez_Drago/2D/Drago_Alejandro_Ramirez_Velasquez_fase2_ss.png';
import alejandro_ramirez_drago_large_bush from '../assets/Recursos planta/Alejandro Ramirez_Drago/2D/Drago_Alejandro_Ramirez_Velasquez_fase3_ss.png';
import alejandro_ramirez_drago_ent from '../assets/Recursos planta/Alejandro Ramirez_Drago/2D/Drago_Alejandro_Ramirez_Velasquez_fase4_ss.png';

import andres_duque_alcaparro_enano_seed from '../assets/Recursos planta/Andres Duque_Alcaparro enano/2D/Alcaparro_enano_Andres_Santiago_Duque_García_fase1_ss.png';
import andres_duque_alcaparro_enano_small_bush from '../assets/Recursos planta/Andres Duque_Alcaparro enano/2D/Alcaparro_enano_Andres_Santiago_Duque_García_fase2_ss.png';
import andres_duque_alcaparro_enano_large_bush from '../assets/Recursos planta/Andres Duque_Alcaparro enano/2D/Alcaparro_enano_Andres_Santiago_Duque_García_fase3_ss.png';
import andres_duque_alcaparro_enano_ent from '../assets/Recursos planta/Andres Duque_Alcaparro enano/2D/Alcaparro_enano_Andres_Santiago_Duque_García_fase4_ss.png';

import andres_morales_duraznillo_seed from '../assets/Recursos planta/Andres Morales_Duraznillo/2D/Duraznillo_Andres_Felipe_Morales_Domínguez_fase1_ss.png';
import andres_morales_duraznillo_small_bush from '../assets/Recursos planta/Andres Morales_Duraznillo/2D/Duraznillo_Andres_Felipe_Morales_Domínguez_fase2_ss.png';
import andres_morales_duraznillo_large_bush from '../assets/Recursos planta/Andres Morales_Duraznillo/2D/Duraznillo_Andres_Felipe_Morales_Domínguez_fase3_ss.png';
import andres_morales_duraznillo_ent from '../assets/Recursos planta/Andres Morales_Duraznillo/2D/Duraznillo_Andres_Felipe_Morales_Domínguez_fase4_ss.png';

import anne_galvis_duraznillo_seed from '../assets/Recursos planta/Anne Galvis_Duraznillo/2D/Duraznillo_Anne_Catalina_Galvis_Carvajal_fase1_ss.png';
import anne_galvis_duraznillo_small_bush from '../assets/Recursos planta/Anne Galvis_Duraznillo/2D/Duraznillo_Anne_Catalina_Galvis_Carvajal_fase2_ss.png';
import anne_galvis_duraznillo_large_bush from '../assets/Recursos planta/Anne Galvis_Duraznillo/2D/Duraznillo_Anne_Catalina_Galvis_Carvajal_fase3_ss.png';
import anne_galvis_duraznillo_ent from '../assets/Recursos planta/Anne Galvis_Duraznillo/2D/Duraznillo_Anne_Catalina_Galvis_Carvajal_fase4_ss.png';

import daniel_orjuela_pino_romer_n_seed from '../assets/Recursos planta/Daniel Orjuela_Pino romerón/2D/Pino_romeron_Daniel_Felipe_Orjuela_Rodríguez_fase1_ss.png';
import daniel_orjuela_pino_romer_n_small_bush from '../assets/Recursos planta/Daniel Orjuela_Pino romerón/2D/Pino_romeron_Daniel_Felipe_Orjuela_Rodríguez_fase2_ss.png';
import daniel_orjuela_pino_romer_n_large_bush from '../assets/Recursos planta/Daniel Orjuela_Pino romerón/2D/Pino_romeron_Daniel_Felipe_Orjuela_Rodríguez_fase3_ss.png';
import daniel_orjuela_pino_romer_n_ent from '../assets/Recursos planta/Daniel Orjuela_Pino romerón/2D/Pino_romeron_Daniel_Felipe_Orjuela_Rodríguez_fase4_ss.png';

import danna_plazas_sietecueros_seed from '../assets/Recursos planta/Danna Plazas_Sietecueros/2D/Sietecueros_Danna_Lucia_Plazas_Lara_fase1_ss.png';
import danna_plazas_sietecueros_small_bush from '../assets/Recursos planta/Danna Plazas_Sietecueros/2D/Sietecueros_Danna_Lucia_Plazas_Lara_fase2_ss.png';
import danna_plazas_sietecueros_large_bush from '../assets/Recursos planta/Danna Plazas_Sietecueros/2D/Sietecueros_Danna_Lucia_Plazas_Lara_fase3_ss.png';
import danna_plazas_sietecueros_ent from '../assets/Recursos planta/Danna Plazas_Sietecueros/2D/Sietecueros_Danna_Lucia_Plazas_Lara_fase4_ss.png';

import david_hernadez_drago_seed from '../assets/Recursos planta/David Hernadez_Drago/2D/Drago_David_Alejandro_Hernández_Prieto_fase1_ss.png';
import david_hernadez_drago_small_bush from '../assets/Recursos planta/David Hernadez_Drago/2D/Drago_David_Alejandro_Hernández_Prieto_fase2_ss.png';
import david_hernadez_drago_large_bush from '../assets/Recursos planta/David Hernadez_Drago/2D/Drago_David_Alejandro_Hernández_Prieto_fase3_ss.png';
import david_hernadez_drago_ent from '../assets/Recursos planta/David Hernadez_Drago/2D/Drago_David_Alejandro_Hernández_Prieto_fase4_ss.png';

import diego_martinez_nogal_seed from '../assets/Recursos planta/Diego Martinez_Nogal/2D/Nogal_Diego_Martínez_Rodríguez_fase1_ss.png';
import diego_martinez_nogal_small_bush from '../assets/Recursos planta/Diego Martinez_Nogal/2D/Nogal_Diego_Martínez_Rodríguez_fase2_ss.png';
import diego_martinez_nogal_large_bush from '../assets/Recursos planta/Diego Martinez_Nogal/2D/Nogal_Diego_Martínez_Rodríguez_fase3_ss.png';
import diego_martinez_nogal_ent from '../assets/Recursos planta/Diego Martinez_Nogal/2D/Nogal_Diego_Martínez_Rodríguez_fase4_ss.png';

import erick_rodriguez_sietecueros_seed from '../assets/Recursos planta/Erick Rodriguez_Sietecueros/2D/Sietecueros_Erick_Santiago_Rodríguez_Paez_fase1_ss.png';
import erick_rodriguez_sietecueros_small_bush from '../assets/Recursos planta/Erick Rodriguez_Sietecueros/2D/Sietecueros_Erick_Santiago_Rodríguez_Paez_fase2_ss.png';
import erick_rodriguez_sietecueros_large_bush from '../assets/Recursos planta/Erick Rodriguez_Sietecueros/2D/Sietecueros_Erick_Santiago_Rodríguez_Paez_fase3_ss.png';
import erick_rodriguez_sietecueros_ent from '../assets/Recursos planta/Erick Rodriguez_Sietecueros/2D/Sietecueros_Erick_Santiago_Rodríguez_Paez_fase4_ss.png';

import fabian_cetina_sietecueros_seed from '../assets/Recursos planta/Fabian Cetina_Sietecueros/2D/Sietecueros_Fabian_Andres_Cetina_Rabon_fase1_ss.png';
import fabian_cetina_sietecueros_small_bush from '../assets/Recursos planta/Fabian Cetina_Sietecueros/2D/Sietecueros_Fabian_Andres_Cetina_Rabon_fase2_ss.png';
import fabian_cetina_sietecueros_large_bush from '../assets/Recursos planta/Fabian Cetina_Sietecueros/2D/Sietecueros_Fabian_Andres_Cetina_Rabon_fase3_ss.png';
import fabian_cetina_sietecueros_ent from '../assets/Recursos planta/Fabian Cetina_Sietecueros/2D/Sietecueros_Fabian_Andres_Cetina_Rabon_fase4_ss.png';

import geraldine_torres_cedrillo_seed from '../assets/Recursos planta/Geraldine Torres_Cedrillo/2D/Cedrillo_Geraldine_Torres_Reyes_fase1_ss.png';
import geraldine_torres_cedrillo_small_bush from '../assets/Recursos planta/Geraldine Torres_Cedrillo/2D/Cedrillo_Geraldine_Torres_Reyes_fase2_ss.png';
import geraldine_torres_cedrillo_large_bush from '../assets/Recursos planta/Geraldine Torres_Cedrillo/2D/Cedrillo_Geraldine_Torres_Reyes_fase3_ss.png';
import geraldine_torres_cedrillo_ent from '../assets/Recursos planta/Geraldine Torres_Cedrillo/2D/Cedrillo_Geraldine_Torres_Reyes_fase4_ss.png';

import gireth_alvarado_duraznillo_seed from '../assets/Recursos planta/Gireth Alvarado_Duraznillo/2D/Duraznillo_Gireth_Sharik_Alvarado_Rubio_fase1_ss.png';
import gireth_alvarado_duraznillo_small_bush from '../assets/Recursos planta/Gireth Alvarado_Duraznillo/2D/Duraznillo_Gireth_Sharik_Alvarado_Rubio_fase2_ss.png';
import gireth_alvarado_duraznillo_large_bush from '../assets/Recursos planta/Gireth Alvarado_Duraznillo/2D/Duraznillo_Gireth_Sharik_Alvarado_Rubio_fase3_ss.png';
import gireth_alvarado_duraznillo_ent from '../assets/Recursos planta/Gireth Alvarado_Duraznillo/2D/Duraznillo_Gireth_Sharik_Alvarado_Rubio_fase4_ss.png';

import isabella_vega_drago_seed from '../assets/Recursos planta/Isabella Vega_Drago/2D/Drago_Isabella_Vega_Heredia_fase1_ss.png';
import isabella_vega_drago_small_bush from '../assets/Recursos planta/Isabella Vega_Drago/2D/Drago_Isabella_Vega_Heredia_fase2_ss.png';
import isabella_vega_drago_large_bush from '../assets/Recursos planta/Isabella Vega_Drago/2D/Drago_Isabella_Vega_Heredia_fase3_ss.png';
import isabella_vega_drago_ent from '../assets/Recursos planta/Isabella Vega_Drago/2D/Drago_Isabella_Vega_Heredia_fase4_ss.png';

import javier_bustos_roble_seed from '../assets/Recursos planta/Javier Bustos_Roble/2D/Roble_Javier_Santiago_Bustos_Laverde_fase1_ss.png';
import javier_bustos_roble_small_bush from '../assets/Recursos planta/Javier Bustos_Roble/2D/Roble_Javier_Santiago_Bustos_Laverde_fase2_ss.png';
import javier_bustos_roble_large_bush from '../assets/Recursos planta/Javier Bustos_Roble/2D/Roble_Javier_Santiago_Bustos_Laverde_fase3_ss.png';
import javier_bustos_roble_ent from '../assets/Recursos planta/Javier Bustos_Roble/2D/Roble_Javier_Santiago_Bustos_Laverde_fase4_ss.png';

import jeronimo_vargas_cedrillo_seed from '../assets/Recursos planta/Jeronimo Vargas_Cedrillo/2D/Cedrillo_Jeronimo_Vargas_Hoyos_fase1_ss.png';
import jeronimo_vargas_cedrillo_small_bush from '../assets/Recursos planta/Jeronimo Vargas_Cedrillo/2D/Cedrillo_Jeronimo_Vargas_Hoyos_fase2_ss.png';
import jeronimo_vargas_cedrillo_large_bush from '../assets/Recursos planta/Jeronimo Vargas_Cedrillo/2D/Cedrillo_Jeronimo_Vargas_Hoyos_fase3_ss.png';
import jeronimo_vargas_cedrillo_ent from '../assets/Recursos planta/Jeronimo Vargas_Cedrillo/2D/Cedrillo_Jeronimo_Vargas_Hoyos_fase4_ss.png';

import jimmy_torres_alcaparro_enano_seed from '../assets/Recursos planta/Jimmy Torres_Alcaparro enano/2D/Alcaparro_enano_Jimmy_Alejandro_Torres_Heraque_fase1_ss.png';
import jimmy_torres_alcaparro_enano_small_bush from '../assets/Recursos planta/Jimmy Torres_Alcaparro enano/2D/Alcaparro_enano_Jimmy_Alejandro_Torres_Heraque_fase2_ss.png';
import jimmy_torres_alcaparro_enano_large_bush from '../assets/Recursos planta/Jimmy Torres_Alcaparro enano/2D/Alcaparro_enano_Jimmy_Alejandro_Torres_Heraque_fase3_ss.png';
import jimmy_torres_alcaparro_enano_ent from '../assets/Recursos planta/Jimmy Torres_Alcaparro enano/2D/Alcaparro_enano_Jimmy_Alejandro_Torres_Heraque_fase4_ss.png';

import juan_acosta_pino_romer_n_seed from '../assets/Recursos planta/Juan Acosta_Pino romerón/2D/Pino_romeron_Juan_Esteban_Acosta_Peña_fase1_ss.png';
import juan_acosta_pino_romer_n_small_bush from '../assets/Recursos planta/Juan Acosta_Pino romerón/2D/Pino_romeron_Juan_Esteban_Acosta_Peña_fase2_ss.png';
import juan_acosta_pino_romer_n_large_bush from '../assets/Recursos planta/Juan Acosta_Pino romerón/2D/Pino_romeron_Juan_Esteban_Acosta_Peña_fase3_ss.png';
import juan_acosta_pino_romer_n_ent from '../assets/Recursos planta/Juan Acosta_Pino romerón/2D/Pino_romeron_Juan_Esteban_Acosta_Peña_fase4_ss.png';

import juan_cuellar_espino_seed from '../assets/Recursos planta/Juan Cuellar_Espino/2D/Duranta_mutisii_Juan_Sebastian_Cuellar_Cardon_fase1_ss.png';
import juan_cuellar_espino_small_bush from '../assets/Recursos planta/Juan Cuellar_Espino/2D/Duranta_mutisii_Juan_Sebastian_Cuellar_Cardon_fase2_ss.png';
import juan_cuellar_espino_large_bush from '../assets/Recursos planta/Juan Cuellar_Espino/2D/Duranta_mutisii_Juan_Sebastian_Cuellar_Cardon_fase3_ss.png';
import juan_cuellar_espino_ent from '../assets/Recursos planta/Juan Cuellar_Espino/2D/Duranta_mutisii_Juan_Sebastian_Cuellar_Cardon_fase4_ss.png';

import juan_lombana_cedro_seed from '../assets/Recursos planta/Juan Lombana_Cedro/2D/Cedro_Juan_Manuel_Lombana_Cárdenas_fase1_ss.png';
import juan_lombana_cedro_small_bush from '../assets/Recursos planta/Juan Lombana_Cedro/2D/Cedro_Juan_Manuel_Lombana_Cárdenas_fase2_ss.png';
import juan_lombana_cedro_large_bush from '../assets/Recursos planta/Juan Lombana_Cedro/2D/Cedro_Juan_Manuel_Lombana_Cárdenas_fase3_ss.png';
import juan_lombana_cedro_ent from '../assets/Recursos planta/Juan Lombana_Cedro/2D/Cedro_Juan_Manuel_Lombana_Cárdenas_fase4_ss.png';

import juan_quintana_rodriguez_seed from '../assets/Recursos planta/Juan Quintana Rodriguez/2D/Manzano_Juan_Esteban_Quintana_Rodríguez_fase1_ss.png';
import juan_quintana_rodriguez_small_bush from '../assets/Recursos planta/Juan Quintana Rodriguez/2D/Manzano_Juan_Esteban_Quintana_Rodríguez_fase2_ss.png';
import juan_quintana_rodriguez_large_bush from '../assets/Recursos planta/Juan Quintana Rodriguez/2D/Manzano_Juan_Esteban_Quintana_Rodríguez_fase3_ss.png';
import juan_quintana_rodriguez_ent from '../assets/Recursos planta/Juan Quintana Rodriguez/2D/Manzano_Juan_Esteban_Quintana_Rodríguez_fase4_ss.png';

import juan_ria_o_mangle_seed from '../assets/Recursos planta/Juan Riaño_Mangle/2D/Mangle_Juan_Sebastian_Riaño_Fernandez_fase1_ss.png';
import juan_ria_o_mangle_small_bush from '../assets/Recursos planta/Juan Riaño_Mangle/2D/Mangle_Juan_Sebastian_Riaño_Fernandez_fase2_ss.png';
import juan_ria_o_mangle_large_bush from '../assets/Recursos planta/Juan Riaño_Mangle/2D/Mangle_Juan_Sebastian_Riaño_Fernandez_fase3_ss.png';
import juan_ria_o_mangle_ent from '../assets/Recursos planta/Juan Riaño_Mangle/2D/Mangle_Juan_Sebastian_Riaño_Fernandez_fase4_ss.png';

import juan_rocha_sietecueros_seed from '../assets/Recursos planta/Juan Rocha_Sietecueros/2D/Sietecueros_Juan_Sebastian_Rocha_Ballen_fase1_ss.png';
import juan_rocha_sietecueros_small_bush from '../assets/Recursos planta/Juan Rocha_Sietecueros/2D/Sietecueros_Juan_Sebastian_Rocha_Ballen_fase2_ss.png';
import juan_rocha_sietecueros_large_bush from '../assets/Recursos planta/Juan Rocha_Sietecueros/2D/Sietecueros_Juan_Sebastian_Rocha_Ballen_fase3_ss.png';
import juan_rocha_sietecueros_ent from '../assets/Recursos planta/Juan Rocha_Sietecueros/2D/Sietecueros_Juan_Sebastian_Rocha_Ballen_fase4_ss.png';

import juan_yalta_aliso_seed from '../assets/Recursos planta/Juan Yalta_Aliso/2D/Aliso_Juan_Pablo_Yalta_Badillo_fase1_ss.png';
import juan_yalta_aliso_small_bush from '../assets/Recursos planta/Juan Yalta_Aliso/2D/Aliso_Juan_Pablo_Yalta_Badillo_fase2_ss.png';
import juan_yalta_aliso_large_bush from '../assets/Recursos planta/Juan Yalta_Aliso/2D/Aliso_Juan_Pablo_Yalta_Badillo_fase3_ss.png';
import juan_yalta_aliso_ent from '../assets/Recursos planta/Juan Yalta_Aliso/2D/Aliso_Juan_Pablo_Yalta_Badillo_fase4_ss.png';

import julian_almonacid_manzano_seed from '../assets/Recursos planta/Julian Almonacid_Manzano/2D/Manzano_Julian_David_Almonacid_Vanegas_fase1_ss.png';
import julian_almonacid_manzano_small_bush from '../assets/Recursos planta/Julian Almonacid_Manzano/2D/Manzano_Julian_David_Almonacid_Vanegas_fase2_ss.png';
import julian_almonacid_manzano_large_bush from '../assets/Recursos planta/Julian Almonacid_Manzano/2D/Manzano_Julian_David_Almonacid_Vanegas_fase3_ss.png';
import julian_almonacid_manzano_ent from '../assets/Recursos planta/Julian Almonacid_Manzano/2D/Manzano_Julian_David_Almonacid_Vanegas_fase4_ss.png';

import karen_bustos_sietecueros_seed from '../assets/Recursos planta/Karen Bustos_Sietecueros/2D/Sietecueros_Karen_Daniela_Bustos_Valero_fase1_ss.png';
import karen_bustos_sietecueros_small_bush from '../assets/Recursos planta/Karen Bustos_Sietecueros/2D/Sietecueros_Karen_Daniela_Bustos_Valero_fase2_ss.png';
import karen_bustos_sietecueros_large_bush from '../assets/Recursos planta/Karen Bustos_Sietecueros/2D/Sietecueros_Karen_Daniela_Bustos_Valero_fase3_ss.png';
import karen_bustos_sietecueros_ent from '../assets/Recursos planta/Karen Bustos_Sietecueros/2D/Sietecueros_Karen_Daniela_Bustos_Valero_fase4_ss.png';

import karen_sandoval_pino_romer_n_seed from '../assets/Recursos planta/Karen Sandoval_Pino romerón/2D/Pino_romeron_Karen_Tatiana_Sandoval_Malagón_fase1_ss.png';
import karen_sandoval_pino_romer_n_small_bush from '../assets/Recursos planta/Karen Sandoval_Pino romerón/2D/Pino_romeron_Karen_Tatiana_Sandoval_Malagón_fase2_ss.png';
import karen_sandoval_pino_romer_n_large_bush from '../assets/Recursos planta/Karen Sandoval_Pino romerón/2D/Pino_romeron_Karen_Tatiana_Sandoval_Malagón_fase3_ss.png';
import karen_sandoval_pino_romer_n_ent from '../assets/Recursos planta/Karen Sandoval_Pino romerón/2D/Pino_romeron_Karen_Tatiana_Sandoval_Malagón_fase4_ss.png';

import karol_duran_sietecueros_seed from '../assets/Recursos planta/Karol Duran_Sietecueros/2D/Sietecueros_Karoll_Alexandra_Duran_Vásquez_fase1_ss.png';
import karol_duran_sietecueros_small_bush from '../assets/Recursos planta/Karol Duran_Sietecueros/2D/Sietecueros_Karoll_Alexandra_Duran_Vásquez_fase2_ss.png';
import karol_duran_sietecueros_large_bush from '../assets/Recursos planta/Karol Duran_Sietecueros/2D/Sietecueros_Karoll_Alexandra_Duran_Vásquez_fase3_ss.png';
import karol_duran_sietecueros_ent from '../assets/Recursos planta/Karol Duran_Sietecueros/2D/Sietecueros_Karoll_Alexandra_Duran_Vásquez_fase4_ss.png';

import laura_iba_ez_sietecueros_seed from '../assets/Recursos planta/Laura Ibañez_Sietecueros/2D/Sietecueros_Laura_Daniela_Ibañez_Rodríguez_fase1_ss.png';
import laura_iba_ez_sietecueros_small_bush from '../assets/Recursos planta/Laura Ibañez_Sietecueros/2D/Sietecueros_Laura_Daniela_Ibañez_Rodríguez_fase2_ss.png';
import laura_iba_ez_sietecueros_large_bush from '../assets/Recursos planta/Laura Ibañez_Sietecueros/2D/Sietecueros_Laura_Daniela_Ibañez_Rodríguez_fase3_ss.png';
import laura_iba_ez_sietecueros_ent from '../assets/Recursos planta/Laura Ibañez_Sietecueros/2D/Sietecueros_Laura_Daniela_Ibañez_Rodríguez_fase4_ss.png';

import laura_parra_alcaparro_enano_seed from '../assets/Recursos planta/Laura Parra_Alcaparro enano/2D/Alcaparro_enano_Laura_Sofia_Parra_Ledezma_fase1_ss.png';
import laura_parra_alcaparro_enano_small_bush from '../assets/Recursos planta/Laura Parra_Alcaparro enano/2D/Alcaparro_enano_Laura_Sofia_Parra_Ledezma_fase2_ss.png';
import laura_parra_alcaparro_enano_large_bush from '../assets/Recursos planta/Laura Parra_Alcaparro enano/2D/Alcaparro_enano_Laura_Sofia_Parra_Ledezma_fase3_ss.png';
import laura_parra_alcaparro_enano_ent from '../assets/Recursos planta/Laura Parra_Alcaparro enano/2D/Alcaparro_enano_Laura_Sofia_Parra_Ledezma_fase4_ss.png';

import lina_rico_mangle_seed from '../assets/Recursos planta/Lina Rico_Mangle/2D/Mangle_Lina_Vanesa_Rico_Laverde_fase1_ss.png';
import lina_rico_mangle_small_bush from '../assets/Recursos planta/Lina Rico_Mangle/2D/Mangle_Lina_Vanesa_Rico_Laverde_fase2_ss.png';
import lina_rico_mangle_large_bush from '../assets/Recursos planta/Lina Rico_Mangle/2D/Mangle_Lina_Vanesa_Rico_Laverde_fase3_ss.png';
import lina_rico_mangle_ent from '../assets/Recursos planta/Lina Rico_Mangle/2D/Mangle_Lina_Vanesa_Rico_Laverde_fase4_ss.png';

import liseth_castro_sietecueros_seed from '../assets/Recursos planta/Liseth Castro_Sietecueros/2D/Sietecueros_Liseth_Tatiana_Castro_Rodríguez_fase1_ss.png';
import liseth_castro_sietecueros_small_bush from '../assets/Recursos planta/Liseth Castro_Sietecueros/2D/Sietecueros_Liseth_Tatiana_Castro_Rodríguez_fase2_ss.png';
import liseth_castro_sietecueros_large_bush from '../assets/Recursos planta/Liseth Castro_Sietecueros/2D/Sietecueros_Liseth_Tatiana_Castro_Rodríguez_fase3_ss.png';
import liseth_castro_sietecueros_ent from '../assets/Recursos planta/Liseth Castro_Sietecueros/2D/Sietecueros_Liseth_Tatiana_Castro_Rodríguez_fase4_ss.png';

import lyander_hernandez_sietecueros_seed from '../assets/Recursos planta/Lyander Hernandez_Sietecueros/2D/Sietecueros_Lyander_Anthony_Hernández_Acosta_fase1_ss.png';
import lyander_hernandez_sietecueros_small_bush from '../assets/Recursos planta/Lyander Hernandez_Sietecueros/2D/Sietecueros_Lyander_Anthony_Hernández_Acosta_fase2_ss.png';
import lyander_hernandez_sietecueros_large_bush from '../assets/Recursos planta/Lyander Hernandez_Sietecueros/2D/Sietecueros_Lyander_Anthony_Hernández_Acosta_fase3_ss.png';
import lyander_hernandez_sietecueros_ent from '../assets/Recursos planta/Lyander Hernandez_Sietecueros/2D/Sietecueros_Lyander_Anthony_Hernández_Acosta_fase4_ss.png';

import maicol_torres_roble_seed from '../assets/Recursos planta/Maicol Torres_Roble/2D/Roble_Maicol_Stiven_Torres_Rivas_fase1_ss.png';
import maicol_torres_roble_small_bush from '../assets/Recursos planta/Maicol Torres_Roble/2D/Roble_Maicol_Stiven_Torres_Rivas_fase2_ss.png';
import maicol_torres_roble_large_bush from '../assets/Recursos planta/Maicol Torres_Roble/2D/Roble_Maicol_Stiven_Torres_Rivas_fase3_ss.png';
import maicol_torres_roble_ent from '../assets/Recursos planta/Maicol Torres_Roble/2D/Roble_Maicol_Stiven_Torres_Rivas_fase4_ss.png';

import maria_casta_o_sietecueros_seed from '../assets/Recursos planta/Maria Castaño_Sietecueros/2D/Desconocido_Maria_Jose_Castaño_Celis_fase1_ss.png';
import maria_casta_o_sietecueros_small_bush from '../assets/Recursos planta/Maria Castaño_Sietecueros/2D/Desconocido_Maria_Jose_Castaño_Celis_fase2_ss.png';
import maria_casta_o_sietecueros_large_bush from '../assets/Recursos planta/Maria Castaño_Sietecueros/2D/Desconocido_Maria_Jose_Castaño_Celis_fase3_ss.png';
import maria_casta_o_sietecueros_ent from '../assets/Recursos planta/Maria Castaño_Sietecueros/2D/Desconocido_Maria_Jose_Castaño_Celis_fase4_ss.png';

import maria_hernandez_alcaparro_enano_seed from '../assets/Recursos planta/Maria Hernandez_Alcaparro enano/2D/Alcaparro_enano_Maria_Paula_Hernandez_Hernandez_fase1_ss.png';
import maria_hernandez_alcaparro_enano_small_bush from '../assets/Recursos planta/Maria Hernandez_Alcaparro enano/2D/Alcaparro_enano_Maria_Paula_Hernandez_Hernandez_fase2_ss.png';
import maria_hernandez_alcaparro_enano_large_bush from '../assets/Recursos planta/Maria Hernandez_Alcaparro enano/2D/Alcaparro_enano_Maria_Paula_Hernandez_Hernandez_fase3_ss.png';
import maria_hernandez_alcaparro_enano_ent from '../assets/Recursos planta/Maria Hernandez_Alcaparro enano/2D/Alcaparro_enano_Maria_Paula_Hernandez_Hernandez_fase4_ss.png';

import mateo_guzm_n_manzano_seed from '../assets/Recursos planta/Mateo Guzmán_Manzano/2D/Manzano_Mateo_Andres_Guzmán_Reyes_fase1_ss.png';
import mateo_guzm_n_manzano_small_bush from '../assets/Recursos planta/Mateo Guzmán_Manzano/2D/Manzano_Mateo_Andres_Guzmán_Reyes_fase2_ss.png';
import mateo_guzm_n_manzano_large_bush from '../assets/Recursos planta/Mateo Guzmán_Manzano/2D/Manzano_Mateo_Andres_Guzmán_Reyes_fase3_ss.png';
import mateo_guzm_n_manzano_ent from '../assets/Recursos planta/Mateo Guzmán_Manzano/2D/Manzano_Mateo_Andres_Guzmán_Reyes_fase4_ss.png';

import mateo_sanchez_sietecueros_seed from '../assets/Recursos planta/Mateo Sanchez_Sietecueros/2D/Sietecueros_Mateo_Sánchez_Ramos_fase1_ss.png';
import mateo_sanchez_sietecueros_small_bush from '../assets/Recursos planta/Mateo Sanchez_Sietecueros/2D/Sietecueros_Mateo_Sánchez_Ramos_fase2_ss.png';
import mateo_sanchez_sietecueros_large_bush from '../assets/Recursos planta/Mateo Sanchez_Sietecueros/2D/Sietecueros_Mateo_Sánchez_Ramos_fase3_ss.png';
import mateo_sanchez_sietecueros_ent from '../assets/Recursos planta/Mateo Sanchez_Sietecueros/2D/Sietecueros_Mateo_Sánchez_Ramos_fase4_ss.png';

import matilde_bermudez_sietecueros_seed from '../assets/Recursos planta/Matilde Bermudez_Sietecueros/2D/Sietecueros_Matilde_Bermúdez_Baquero_fase1_ss.png';
import matilde_bermudez_sietecueros_small_bush from '../assets/Recursos planta/Matilde Bermudez_Sietecueros/2D/Sietecueros_Matilde_Bermúdez_Baquero_fase2_ss.png';
import matilde_bermudez_sietecueros_large_bush from '../assets/Recursos planta/Matilde Bermudez_Sietecueros/2D/Sietecueros_Matilde_Bermúdez_Baquero_fase3_ss.png';
import matilde_bermudez_sietecueros_ent from '../assets/Recursos planta/Matilde Bermudez_Sietecueros/2D/Sietecueros_Matilde_Bermúdez_Baquero_fase4_ss.png';

import miguel_cartagena_manzano_seed from '../assets/Recursos planta/Miguel Cartagena_Manzano/2D/Manzano_Miguel_Angel_Cartagena_Herrera_fase1_ss.png';
import miguel_cartagena_manzano_small_bush from '../assets/Recursos planta/Miguel Cartagena_Manzano/2D/Manzano_Miguel_Angel_Cartagena_Herrera_fase2_ss.png';
import miguel_cartagena_manzano_large_bush from '../assets/Recursos planta/Miguel Cartagena_Manzano/2D/Manzano_Miguel_Angel_Cartagena_Herrera_fase3_ss.png';
import miguel_cartagena_manzano_ent from '../assets/Recursos planta/Miguel Cartagena_Manzano/2D/Manzano_Miguel_Angel_Cartagena_Herrera_fase4_ss.png';

import paula_rinc_n_manzano_seed from '../assets/Recursos planta/Paula Rincón_Manzano/2D/Manzano_Paula_Alejandra_Rincón_Otalvaro_fase1_ss.png';
import paula_rinc_n_manzano_small_bush from '../assets/Recursos planta/Paula Rincón_Manzano/2D/Manzano_Paula_Alejandra_Rincón_Otalvaro_fase2_ss.png';
import paula_rinc_n_manzano_large_bush from '../assets/Recursos planta/Paula Rincón_Manzano/2D/Manzano_Paula_Alejandra_Rincón_Otalvaro_fase3_ss.png';
import paula_rinc_n_manzano_ent from '../assets/Recursos planta/Paula Rincón_Manzano/2D/Manzano_Paula_Alejandra_Rincón_Otalvaro_fase4_ss.png';

import santiago_correa_pino_romer_n_seed from '../assets/Recursos planta/Santiago Correa_Pino romerón/2D/Pino_romeron_Santiago_Correa_Fandiño_fase1_ss.png';
import santiago_correa_pino_romer_n_small_bush from '../assets/Recursos planta/Santiago Correa_Pino romerón/2D/Pino_romeron_Santiago_Correa_Fandiño_fase2_ss.png';
import santiago_correa_pino_romer_n_large_bush from '../assets/Recursos planta/Santiago Correa_Pino romerón/2D/Pino_romeron_Santiago_Correa_Fandiño_fase3_ss.png';
import santiago_correa_pino_romer_n_ent from '../assets/Recursos planta/Santiago Correa_Pino romerón/2D/Pino_romeron_Santiago_Correa_Fandiño_fase4_ss.png';

import sara_rojas_alcaparro_enano_seed from '../assets/Recursos planta/Sara Rojas_Alcaparro enano/2D/Alcaparro_enano_Sara_Viviana_Rojas_Gómez_fase1_ss.png';
import sara_rojas_alcaparro_enano_small_bush from '../assets/Recursos planta/Sara Rojas_Alcaparro enano/2D/Alcaparro_enano_Sara_Viviana_Rojas_Gómez_fase2_ss.png';
import sara_rojas_alcaparro_enano_large_bush from '../assets/Recursos planta/Sara Rojas_Alcaparro enano/2D/Alcaparro_enano_Sara_Viviana_Rojas_Gómez_fase3_ss.png';
import sara_rojas_alcaparro_enano_ent from '../assets/Recursos planta/Sara Rojas_Alcaparro enano/2D/Alcaparro_enano_Sara_Viviana_Rojas_Gómez_fase4_ss.png';

import sergio_palacios_sietecueros_seed from '../assets/Recursos planta/Sergio Palacios_Sietecueros/2D/Sietecueros_Sergio_Danilo_Palacios_Castillo_fase1_ss.png';
import sergio_palacios_sietecueros_small_bush from '../assets/Recursos planta/Sergio Palacios_Sietecueros/2D/Sietecueros_Sergio_Danilo_Palacios_Castillo_fase2_ss.png';
import sergio_palacios_sietecueros_large_bush from '../assets/Recursos planta/Sergio Palacios_Sietecueros/2D/Sietecueros_Sergio_Danilo_Palacios_Castillo_fase3_ss.png';
import sergio_palacios_sietecueros_ent from '../assets/Recursos planta/Sergio Palacios_Sietecueros/2D/Sietecueros_Sergio_Danilo_Palacios_Castillo_fase4_ss.png';

import susan_doblado_sietecueros_seed from '../assets/Recursos planta/Susan Doblado_Sietecueros/2D/Sietecueros_Susan_Michelle_Doblado_Torres_fase1_ss.png';
import susan_doblado_sietecueros_small_bush from '../assets/Recursos planta/Susan Doblado_Sietecueros/2D/Sietecueros_Susan_Michelle_Doblado_Torres_fase2_ss.png';
import susan_doblado_sietecueros_large_bush from '../assets/Recursos planta/Susan Doblado_Sietecueros/2D/Sietecueros_Susan_Michelle_Doblado_Torres_fase3_ss.png';
import susan_doblado_sietecueros_ent from '../assets/Recursos planta/Susan Doblado_Sietecueros/2D/Sietecueros_Susan_Michelle_Doblado_Torres_fase4_ss.png';

import tomas_buitrago_drago_seed from '../assets/Recursos planta/Tomas Buitrago_Drago/2D/Drago_Tomas_Mateo_Buitrago_Gutiérrez_fase1_ss.png';
import tomas_buitrago_drago_small_bush from '../assets/Recursos planta/Tomas Buitrago_Drago/2D/Drago_Tomas_Mateo_Buitrago_Gutiérrez_fase2_ss.png';
import tomas_buitrago_drago_large_bush from '../assets/Recursos planta/Tomas Buitrago_Drago/2D/Drago_Tomas_Mateo_Buitrago_Gutiérrez_fase3_ss.png';
import tomas_buitrago_drago_ent from '../assets/Recursos planta/Tomas Buitrago_Drago/2D/Drago_Tomas_Mateo_Buitrago_Gutiérrez_fase4_ss.png';

import tomas_marin_cedrillo_seed from '../assets/Recursos planta/Tomas Marin_Cedrillo/2D/Cedrillo_Tomas_Marín_Ojeda_fase1_ss.png';
import tomas_marin_cedrillo_small_bush from '../assets/Recursos planta/Tomas Marin_Cedrillo/2D/Cedrillo_Tomas_Marín_Ojeda_fase2_ss.png';
import tomas_marin_cedrillo_large_bush from '../assets/Recursos planta/Tomas Marin_Cedrillo/2D/Cedrillo_Tomas_Marín_Ojeda_fase3_ss.png';
import tomas_marin_cedrillo_ent from '../assets/Recursos planta/Tomas Marin_Cedrillo/2D/Cedrillo_Tomas_Marín_Ojeda_fase4_ss.png';

import yuri_casta_eda_drago_seed from '../assets/Recursos planta/Yuri Castañeda_Drago/2D/Drago_Yuri_Alexandra_Castañeda_Montaño_fase1_ss.png';
import yuri_casta_eda_drago_small_bush from '../assets/Recursos planta/Yuri Castañeda_Drago/2D/Drago_Yuri_Alexandra_Castañeda_Montaño_fase2_ss.png';
import yuri_casta_eda_drago_large_bush from '../assets/Recursos planta/Yuri Castañeda_Drago/2D/Drago_Yuri_Alexandra_Castañeda_Montaño_fase3_ss.png';
import yuri_casta_eda_drago_ent from '../assets/Recursos planta/Yuri Castañeda_Drago/2D/Drago_Yuri_Alexandra_Castañeda_Montaño_fase4_ss.png';


// ─────────────────────────────────────────────
// Helper para crear configuraciones fácilmente
// ─────────────────────────────────────────────
function createPlantConfig(
  sources: { seed: string; small_bush: string; large_bush: string; ent: string },
  scales: number | { seed: number; small_bush: number; large_bush: number; ent: number } = 1.0,
  frameCount: number = 18,
  frameWidth: number = 477,
  frameHeight: number = 510
): Record<PlantPhase, SpriteConfig> {
  const s = typeof scales === "number" ? { seed: scales, small_bush: scales, large_bush: scales, ent: scales } : scales;
  const base = { frameWidth, frameHeight, frameCount };
  return {
    seed: { ...base, src: sources.seed, scale: s.seed, hitbox: "w-32 h-32" },
    small_bush: { ...base, src: sources.small_bush, scale: s.small_bush, hitbox: "w-48 h-48" },
    large_bush: { ...base, src: sources.large_bush, scale: s.large_bush, hitbox: "w-56 h-64" },
    ent: { ...base, src: sources.ent, scale: s.ent, hitbox: "w-64 h-80" },
  };
}

// ─────────────────────────────────────────────
// Registro completo: speciesId → fase → SpriteConfig
// ─────────────────────────────────────────────
export const PLANT_SPRITE_REGISTRY: Record<string, Record<PlantPhase, SpriteConfig>> = {
  pasto: createPlantConfig(
    { seed: pasto_seed.src, small_bush: pasto_small_bush.src, large_bush: pasto_large_bush.src, ent: pasto_ent.src },
    { seed: 2.5, small_bush: 2.3, large_bush: 2.0, ent: 1.2 }
  ),
  nogal: createPlantConfig(
    { seed: nogal_seed.src, small_bush: nogal_small_bush.src, large_bush: nogal_large_bush.src, ent: nogal_ent.src }
  ),
  cedro: createPlantConfig(
    { seed: cedro_seed.src, small_bush: cedro_small_bush.src, large_bush: cedro_large_bush.src, ent: cedro_ent.src }
  ),
  cajeto: createPlantConfig(
    { seed: cajeto_seed.src, small_bush: cajeto_small_bush.src, large_bush: cajeto_large_bush.src, ent: cajeto_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),

  'Carlos Correa': createPlantConfig(
    { seed: carlos_correa_drago_seed.src, small_bush: carlos_correa_drago_small_bush.src, large_bush: carlos_correa_drago_large_bush.src, ent: carlos_correa_drago_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Jesica Piñeros': createPlantConfig(
    { seed: jesica_pineros_drago_seed.src, small_bush: jesica_pineros_drago_small_bush.src, large_bush: jesica_pineros_drago_large_bush.src, ent: jesica_pineros_drago_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),

  'Adriana Espitia': createPlantConfig(
    { seed: adriana_espitia_drago_seed.src, small_bush: adriana_espitia_drago_small_bush.src, large_bush: adriana_espitia_drago_large_bush.src, ent: adriana_espitia_drago_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Alejandro Ramirez': createPlantConfig(
    { seed: alejandro_ramirez_drago_seed.src, small_bush: alejandro_ramirez_drago_small_bush.src, large_bush: alejandro_ramirez_drago_large_bush.src, ent: alejandro_ramirez_drago_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Andres Duque': createPlantConfig(
    { seed: andres_duque_alcaparro_enano_seed.src, small_bush: andres_duque_alcaparro_enano_small_bush.src, large_bush: andres_duque_alcaparro_enano_large_bush.src, ent: andres_duque_alcaparro_enano_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Andres Morales': createPlantConfig(
    { seed: andres_morales_duraznillo_seed.src, small_bush: andres_morales_duraznillo_small_bush.src, large_bush: andres_morales_duraznillo_large_bush.src, ent: andres_morales_duraznillo_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Anne Galvis': createPlantConfig(
    { seed: anne_galvis_duraznillo_seed.src, small_bush: anne_galvis_duraznillo_small_bush.src, large_bush: anne_galvis_duraznillo_large_bush.src, ent: anne_galvis_duraznillo_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Daniel Orjuela': createPlantConfig(
    { seed: daniel_orjuela_pino_romer_n_seed.src, small_bush: daniel_orjuela_pino_romer_n_small_bush.src, large_bush: daniel_orjuela_pino_romer_n_large_bush.src, ent: daniel_orjuela_pino_romer_n_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Danna Plazas': createPlantConfig(
    { seed: danna_plazas_sietecueros_seed.src, small_bush: danna_plazas_sietecueros_small_bush.src, large_bush: danna_plazas_sietecueros_large_bush.src, ent: danna_plazas_sietecueros_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'David Hernadez': createPlantConfig(
    { seed: david_hernadez_drago_seed.src, small_bush: david_hernadez_drago_small_bush.src, large_bush: david_hernadez_drago_large_bush.src, ent: david_hernadez_drago_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Diego Martinez': createPlantConfig(
    { seed: diego_martinez_nogal_seed.src, small_bush: diego_martinez_nogal_small_bush.src, large_bush: diego_martinez_nogal_large_bush.src, ent: diego_martinez_nogal_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Erick Rodriguez': createPlantConfig(
    { seed: erick_rodriguez_sietecueros_seed.src, small_bush: erick_rodriguez_sietecueros_small_bush.src, large_bush: erick_rodriguez_sietecueros_large_bush.src, ent: erick_rodriguez_sietecueros_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Fabian Cetina': createPlantConfig(
    { seed: fabian_cetina_sietecueros_seed.src, small_bush: fabian_cetina_sietecueros_small_bush.src, large_bush: fabian_cetina_sietecueros_large_bush.src, ent: fabian_cetina_sietecueros_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Geraldine Torres': createPlantConfig(
    { seed: geraldine_torres_cedrillo_seed.src, small_bush: geraldine_torres_cedrillo_small_bush.src, large_bush: geraldine_torres_cedrillo_large_bush.src, ent: geraldine_torres_cedrillo_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Gireth Alvarado': createPlantConfig(
    { seed: gireth_alvarado_duraznillo_seed.src, small_bush: gireth_alvarado_duraznillo_small_bush.src, large_bush: gireth_alvarado_duraznillo_large_bush.src, ent: gireth_alvarado_duraznillo_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Isabella Vega': createPlantConfig(
    { seed: isabella_vega_drago_seed.src, small_bush: isabella_vega_drago_small_bush.src, large_bush: isabella_vega_drago_large_bush.src, ent: isabella_vega_drago_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Javier Bustos': createPlantConfig(
    { seed: javier_bustos_roble_seed.src, small_bush: javier_bustos_roble_small_bush.src, large_bush: javier_bustos_roble_large_bush.src, ent: javier_bustos_roble_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Jeronimo Vargas': createPlantConfig(
    { seed: jeronimo_vargas_cedrillo_seed.src, small_bush: jeronimo_vargas_cedrillo_small_bush.src, large_bush: jeronimo_vargas_cedrillo_large_bush.src, ent: jeronimo_vargas_cedrillo_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Jimmy Torres': createPlantConfig(
    { seed: jimmy_torres_alcaparro_enano_seed.src, small_bush: jimmy_torres_alcaparro_enano_small_bush.src, large_bush: jimmy_torres_alcaparro_enano_large_bush.src, ent: jimmy_torres_alcaparro_enano_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Juan Acosta': createPlantConfig(
    { seed: juan_acosta_pino_romer_n_seed.src, small_bush: juan_acosta_pino_romer_n_small_bush.src, large_bush: juan_acosta_pino_romer_n_large_bush.src, ent: juan_acosta_pino_romer_n_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Juan Cuellar': createPlantConfig(
    { seed: juan_cuellar_espino_seed.src, small_bush: juan_cuellar_espino_small_bush.src, large_bush: juan_cuellar_espino_large_bush.src, ent: juan_cuellar_espino_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Juan Lombana': createPlantConfig(
    { seed: juan_lombana_cedro_seed.src, small_bush: juan_lombana_cedro_small_bush.src, large_bush: juan_lombana_cedro_large_bush.src, ent: juan_lombana_cedro_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Juan Quintana Rodriguez': createPlantConfig(
    { seed: juan_quintana_rodriguez_seed.src, small_bush: juan_quintana_rodriguez_small_bush.src, large_bush: juan_quintana_rodriguez_large_bush.src, ent: juan_quintana_rodriguez_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Juan Riaño': createPlantConfig(
    { seed: juan_ria_o_mangle_seed.src, small_bush: juan_ria_o_mangle_small_bush.src, large_bush: juan_ria_o_mangle_large_bush.src, ent: juan_ria_o_mangle_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Juan Rocha': createPlantConfig(
    { seed: juan_rocha_sietecueros_seed.src, small_bush: juan_rocha_sietecueros_small_bush.src, large_bush: juan_rocha_sietecueros_large_bush.src, ent: juan_rocha_sietecueros_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Juan Yalta': createPlantConfig(
    { seed: juan_yalta_aliso_seed.src, small_bush: juan_yalta_aliso_small_bush.src, large_bush: juan_yalta_aliso_large_bush.src, ent: juan_yalta_aliso_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Julian Almonacid': createPlantConfig(
    { seed: julian_almonacid_manzano_seed.src, small_bush: julian_almonacid_manzano_small_bush.src, large_bush: julian_almonacid_manzano_large_bush.src, ent: julian_almonacid_manzano_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Karen Bustos': createPlantConfig(
    { seed: karen_bustos_sietecueros_seed.src, small_bush: karen_bustos_sietecueros_small_bush.src, large_bush: karen_bustos_sietecueros_large_bush.src, ent: karen_bustos_sietecueros_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Karen Sandoval': createPlantConfig(
    { seed: karen_sandoval_pino_romer_n_seed.src, small_bush: karen_sandoval_pino_romer_n_small_bush.src, large_bush: karen_sandoval_pino_romer_n_large_bush.src, ent: karen_sandoval_pino_romer_n_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Karol Duran': createPlantConfig(
    { seed: karol_duran_sietecueros_seed.src, small_bush: karol_duran_sietecueros_small_bush.src, large_bush: karol_duran_sietecueros_large_bush.src, ent: karol_duran_sietecueros_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Laura Ibañez': createPlantConfig(
    { seed: laura_iba_ez_sietecueros_seed.src, small_bush: laura_iba_ez_sietecueros_small_bush.src, large_bush: laura_iba_ez_sietecueros_large_bush.src, ent: laura_iba_ez_sietecueros_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Laura Parra': createPlantConfig(
    { seed: laura_parra_alcaparro_enano_seed.src, small_bush: laura_parra_alcaparro_enano_small_bush.src, large_bush: laura_parra_alcaparro_enano_large_bush.src, ent: laura_parra_alcaparro_enano_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Lina Rico': createPlantConfig(
    { seed: lina_rico_mangle_seed.src, small_bush: lina_rico_mangle_small_bush.src, large_bush: lina_rico_mangle_large_bush.src, ent: lina_rico_mangle_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Liseth Castro': createPlantConfig(
    { seed: liseth_castro_sietecueros_seed.src, small_bush: liseth_castro_sietecueros_small_bush.src, large_bush: liseth_castro_sietecueros_large_bush.src, ent: liseth_castro_sietecueros_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Lyander Hernandez': createPlantConfig(
    { seed: lyander_hernandez_sietecueros_seed.src, small_bush: lyander_hernandez_sietecueros_small_bush.src, large_bush: lyander_hernandez_sietecueros_large_bush.src, ent: lyander_hernandez_sietecueros_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Maicol Torres': createPlantConfig(
    { seed: maicol_torres_roble_seed.src, small_bush: maicol_torres_roble_small_bush.src, large_bush: maicol_torres_roble_large_bush.src, ent: maicol_torres_roble_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Maria Castaño': createPlantConfig(
    { seed: maria_casta_o_sietecueros_seed.src, small_bush: maria_casta_o_sietecueros_small_bush.src, large_bush: maria_casta_o_sietecueros_large_bush.src, ent: maria_casta_o_sietecueros_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Maria Hernandez': createPlantConfig(
    { seed: maria_hernandez_alcaparro_enano_seed.src, small_bush: maria_hernandez_alcaparro_enano_small_bush.src, large_bush: maria_hernandez_alcaparro_enano_large_bush.src, ent: maria_hernandez_alcaparro_enano_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Mateo Guzmán': createPlantConfig(
    { seed: mateo_guzm_n_manzano_seed.src, small_bush: mateo_guzm_n_manzano_small_bush.src, large_bush: mateo_guzm_n_manzano_large_bush.src, ent: mateo_guzm_n_manzano_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Mateo Sanchez': createPlantConfig(
    { seed: mateo_sanchez_sietecueros_seed.src, small_bush: mateo_sanchez_sietecueros_small_bush.src, large_bush: mateo_sanchez_sietecueros_large_bush.src, ent: mateo_sanchez_sietecueros_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Matilde Bermudez': createPlantConfig(
    { seed: matilde_bermudez_sietecueros_seed.src, small_bush: matilde_bermudez_sietecueros_small_bush.src, large_bush: matilde_bermudez_sietecueros_large_bush.src, ent: matilde_bermudez_sietecueros_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Miguel Cartagena': createPlantConfig(
    { seed: miguel_cartagena_manzano_seed.src, small_bush: miguel_cartagena_manzano_small_bush.src, large_bush: miguel_cartagena_manzano_large_bush.src, ent: miguel_cartagena_manzano_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Paula Rincón': createPlantConfig(
    { seed: paula_rinc_n_manzano_seed.src, small_bush: paula_rinc_n_manzano_small_bush.src, large_bush: paula_rinc_n_manzano_large_bush.src, ent: paula_rinc_n_manzano_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Santiago Correa': createPlantConfig(
    { seed: santiago_correa_pino_romer_n_seed.src, small_bush: santiago_correa_pino_romer_n_small_bush.src, large_bush: santiago_correa_pino_romer_n_large_bush.src, ent: santiago_correa_pino_romer_n_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Sara Rojas': createPlantConfig(
    { seed: sara_rojas_alcaparro_enano_seed.src, small_bush: sara_rojas_alcaparro_enano_small_bush.src, large_bush: sara_rojas_alcaparro_enano_large_bush.src, ent: sara_rojas_alcaparro_enano_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Sergio Palacios': createPlantConfig(
    { seed: sergio_palacios_sietecueros_seed.src, small_bush: sergio_palacios_sietecueros_small_bush.src, large_bush: sergio_palacios_sietecueros_large_bush.src, ent: sergio_palacios_sietecueros_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Susan Doblado': createPlantConfig(
    { seed: susan_doblado_sietecueros_seed.src, small_bush: susan_doblado_sietecueros_small_bush.src, large_bush: susan_doblado_sietecueros_large_bush.src, ent: susan_doblado_sietecueros_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Tomas Buitrago': createPlantConfig(
    { seed: tomas_buitrago_drago_seed.src, small_bush: tomas_buitrago_drago_small_bush.src, large_bush: tomas_buitrago_drago_large_bush.src, ent: tomas_buitrago_drago_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Tomas Marin': createPlantConfig(
    { seed: tomas_marin_cedrillo_seed.src, small_bush: tomas_marin_cedrillo_small_bush.src, large_bush: tomas_marin_cedrillo_large_bush.src, ent: tomas_marin_cedrillo_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),
  'Yuri Castañeda': createPlantConfig(
    { seed: yuri_casta_eda_drago_seed.src, small_bush: yuri_casta_eda_drago_small_bush.src, large_bush: yuri_casta_eda_drago_large_bush.src, ent: yuri_casta_eda_drago_ent.src },
    { seed: 0.3, small_bush: 0.5, large_bush: 1, ent: 1.3 }
  ),

  // ── Para añadir una nueva especie: ──
  // nueva_especie: createPlantConfig(
  //   { seed: nueva_seed.src, small_bush: nueva_small_bush.src, large_bush: nueva_large_bush.src, ent: nueva_ent.src },
  //   1.0, // Escala (opcional, por defecto 1.0)
  //   1    // Número de frames (opcional, por defecto 18)
  // ),
};

/** Especie de fallback si la activa no tiene sprites registrados */
export const FALLBACK_SPECIES = "pasto";

/** Devuelve la config de un sprite dado speciesId y subid, con fallback garantizado */
export function getSpriteConfig(speciesId: string, subid: string | undefined, phase: PlantPhase): SpriteConfig {
  const key = (subid && PLANT_SPRITE_REGISTRY[subid]) ? subid : (PLANT_SPRITE_REGISTRY[speciesId] ? speciesId : FALLBACK_SPECIES);
  const species = PLANT_SPRITE_REGISTRY[key];
  return species[phase] ?? species["seed"];
}

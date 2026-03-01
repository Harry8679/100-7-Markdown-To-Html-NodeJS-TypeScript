import { ConvertStats } from '../types/markdown.types';

export const displayWelcome = (): void => {
  console.clear();
  console.log('╔══════════════════════════════════════╗');
  console.log('║   📝 Markdown to HTML Converter v1.0  ║');
  console.log('╚══════════════════════════════════════╝');
  console.log();
};

export const displayMenu = (): void => {
  console.log('─'.repeat(44));
  console.log('  [1] Convertir un fichier .md');
  console.log('  [2] Convertir du texte Markdown direct');
  console.log('  [3] Convertir avec thème sombre');
  console.log('  [4] Convertir sans styles CSS');
  console.log('  [q] Quitter');
  console.log('─'.repeat(44));
  console.log();
};

export const displayStats = (stats: ConvertStats, outputFile: string): void => {
  console.log('\n✅ Conversion réussie !\n');
  console.log('📊 Statistiques :');
  console.log('─'.repeat(35));
  console.log(`  Fichier généré : ${outputFile}`);
  console.log(`  Blocs parsés   : ${stats.blocks}`);
  console.log(`  Titres         : ${stats.headings}`);
  console.log(`  Paragraphes    : ${stats.paragraphs}`);
  console.log(`  Blocs de code  : ${stats.codeBlocks}`);
  console.log(`  Tableaux       : ${stats.tables}`);
  console.log(`  Listes         : ${stats.lists}`);
  console.log(`  Taille entrée  : ${stats.inputSize} bytes`);
  console.log(`  Taille sortie  : ${stats.outputSize} bytes`);
  console.log('─'.repeat(35));
  console.log();
};

export const displayError   = (msg: string): void => console.log(`\n❌ ${msg}\n`);
export const displaySuccess = (msg: string): void => console.log(`\n✅ ${msg}\n`);
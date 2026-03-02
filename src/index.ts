import * as fs   from 'fs/promises';
import * as path from 'path';
import { BlockParser }   from './parser/block.parser';
import { HtmlRenderer }  from './renderer/html.renderer';
import { ConvertOptions } from './types/markdown.types';
import { question, closePrompt } from './utils/prompt';
import {
  displayWelcome,
  displayMenu,
  displayStats,
  displayError,
} from './utils/display';

const parser   = new BlockParser();
const renderer = new HtmlRenderer();

// Dossier de sortie
const OUTPUT_DIR = path.join(process.cwd(), 'output');

const convert = async (
  markdown: string,
  outputFileName: string,
  options: ConvertOptions
): Promise<void> => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const inputSize = Buffer.byteLength(markdown, 'utf-8');
  const blocks    = parser.parse(markdown);
  const result    = renderer.render(blocks, options);

  result.stats.inputSize = inputSize;

  const outputPath = path.join(OUTPUT_DIR, outputFileName);
  await fs.writeFile(outputPath, result.html, 'utf-8');

  displayStats(result.stats, outputPath);
};

const main = async (): Promise<void> => {
  displayWelcome();

  while (true) {
    displayMenu();
    const choice = (await question('Votre choix : ')).trim().toLowerCase();

    switch (choice) {

      case '1':
      case '3':
      case '4': {
        const filePath = await question('Chemin du fichier .md : ');

        try {
          const markdown = await fs.readFile(filePath.trim(), 'utf-8');
          const baseName = path.basename(filePath.trim(), '.md');
          const title    = await question(`Titre de la page (défaut: "${baseName}") : `);
          const addToc   = await question('Ajouter une table des matières ? (o/N) : ');

          const options: ConvertOptions = {
            includeStyles:     choice !== '4',
            theme:             choice === '3' ? 'dark' : 'light',
            title:             title.trim() || baseName,
            addTableOfContents: addToc.toLowerCase() === 'o',
          };

          await convert(markdown, `${baseName}.html`, options);
        } catch {
          displayError('Fichier introuvable ou illisible.');
        }
        break;
      }

      case '2': {
        console.log('Entrez votre Markdown (terminez avec une ligne "END") :');
        const lines: string[] = [];

        while (true) {
          const line = await question('');
          if (line === 'END') break;
          lines.push(line);
        }

        const markdown = lines.join('\n');
        const title    = await question('Titre de la page : ');

        const options: ConvertOptions = {
          includeStyles: true,
          theme: 'light',
          title: title.trim() || 'Document',
          addTableOfContents: false,
        };

        await convert(markdown, 'direct-input.html', options);
        break;
      }

      case 'q': {
        console.log('\n👋 À bientôt !\n');
        closePrompt();
        return;
      }

      default:
        displayError('Choix invalide.');
    }
  }
};

main();
import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from '../config/loader';
import {
  addAnnotation,
  removeAnnotations,
  formatAnnotationReport,
  annotateConfig,
  AnnotationMap,
} from '../config/annotator';

export interface AnnotateArgs {
  configFile: string;
  action: 'add' | 'remove' | 'list';
  key?: string;
  note?: string;
  author?: string;
  annotationFile?: string;
}

export function parseAnnotateArgs(argv: string[]): AnnotateArgs {
  const args: AnnotateArgs = {
    configFile: '',
    action: 'list',
  };
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--config':   args.configFile = argv[++i]; break;
      case '--action':  args.action = argv[++i] as AnnotateArgs['action']; break;
      case '--key':     args.key = argv[++i]; break;
      case '--note':    args.note = argv[++i]; break;
      case '--author':  args.author = argv[++i]; break;
      case '--ann-file': args.annotationFile = argv[++i]; break;
    }
  }
  if (!args.configFile) throw new Error('--config is required');
  return args;
}

function loadAnnotationFile(filePath: string): AnnotationMap {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as AnnotationMap;
}

function saveAnnotationFile(filePath: string, map: AnnotationMap): void {
  fs.writeFileSync(filePath, JSON.stringify(map, null, 2), 'utf-8');
}

export async function runAnnotateCmd(args: AnnotateArgs): Promise<void> {
  const config = loadConfig(args.configFile);
  const annFile = args.annotationFile ??
    path.join(path.dirname(args.configFile), '.annotations.json');
  let annotations = loadAnnotationFile(annFile);

  if (args.action === 'add') {
    if (!args.key || !args.note) throw new Error('--key and --note required for add');
    annotations = addAnnotation(annotations, args.key, args.note, args.author);
    const { annotations: cleaned } = annotateConfig(config, annotations);
    saveAnnotationFile(annFile, cleaned);
    console.log(`Annotation added for '${args.key}'.`);
  } else if (args.action === 'remove') {
    if (!args.key) throw new Error('--key required for remove');
    annotations = removeAnnotations(annotations, args.key);
    saveAnnotationFile(annFile, annotations);
    console.log(`Annotations removed for '${args.key}'.`);
  } else {
    const { annotations: cleaned } = annotateConfig(config, annotations);
    console.log(formatAnnotationReport(cleaned));
  }
}

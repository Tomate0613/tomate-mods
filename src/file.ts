import { readFabricMod, readQuiltMod } from '@xmcl/mod-parser';
import {
  open as openZip,
  readAllEntries as readAllZipEntries,
  readEntry as readZipEntry,
} from '@xmcl/unzip';
import * as T from './types';

async function parseModIcon(filepath: string, iconPath?: string) {
  if (!iconPath) {
    return undefined;
  }

  try {
    const jar = await openZip(filepath);
    const entries = await readAllZipEntries(jar);

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (entry.fileName === iconPath) {
        const iconData = await readZipEntry(jar, entry);

        jar.close();
        return `data:image/png;base64,${iconData.toString('base64')}`;
      }
    }

    jar.close();
    return undefined;
  } catch (e) {
    throw new Error(`Could not load icon ${e}`);
  }
}

export async function parseMod(modPath: string): Promise<{
  provider: 'custom';
  project: T.Project;
  version: { id: string };
}> {
  try {
    const fabricMod = await readFabricMod(modPath);

    return {
      provider: 'custom',

      version: { id: fabricMod.version },
      project: {
        id: fabricMod.id,
        name: fabricMod.name ?? 'Unknown name',
        description: fabricMod.description ?? 'Unknown description',
        slug: fabricMod.id,
        icon: await parseModIcon(modPath, fabricMod.icon),
        latestVersions: [fabricMod.version],
      },
    };
  } catch (e) {}

  try {
    const quiltMod = await readQuiltMod(modPath);

    return {
      provider: 'custom',

      version: { id: quiltMod.quilt_loader.version },

      project: {
        id: quiltMod.quilt_loader.id,
        name: quiltMod.quilt_loader.metadata?.name ?? 'Unknown name',
        description:
          quiltMod.quilt_loader.metadata?.description ?? 'Unknown description',
        slug: quiltMod.quilt_loader.id,
        icon: await parseModIcon(modPath, quiltMod.quilt_loader.version),

        latestVersions: [quiltMod.quilt_loader.version],
      },
    };
  } catch (e) {}

  throw new Error('Could not parse mod');
}

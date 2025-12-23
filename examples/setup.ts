import { CurseforgeProvider, ModrinthProvider, TomateMods } from 'tomate-mods';

export const tomateMods = TomateMods.fromProviders(
  new ModrinthProvider('doublekekse/tomate-mods'),
  new CurseforgeProvider(
    'doublekekse/tomate-mods',
    process.env.CURSEFORGE_API_KEY
  )
);


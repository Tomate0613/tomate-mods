import { tomateMods } from 'setup';

const versions = await tomateMods.provider('modrinth').versions('boids');

import { tomateMods } from 'setup';
import { queryParams } from './stub';

const provider = tomateMods.provider('modrinth');
const versions = await provider.versions('boids', queryParams);

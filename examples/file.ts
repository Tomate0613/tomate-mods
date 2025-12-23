import { tomateMods } from 'setup';

const file = await tomateMods.fileVersion('./boids.jar');

if (file) {
  const { provider, version } = file;
}

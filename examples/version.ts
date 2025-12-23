import { tomateMods } from 'setup';

const version = await tomateMods
  .provider('modrinth')
  .version('boids', 'WKjzEyfQ');

import { tomateMods } from 'setup';

const provider = tomateMods.provider('modrinth');

const version = await provider.version('boids', 'WKjzEyfQ');
await provider.download(version, './boids.jar');

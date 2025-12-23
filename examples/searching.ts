import { tomateMods } from 'setup';
import { queryParams } from './stub';

const searchResult = await tomateMods.provider('modrinth').search(queryParams);

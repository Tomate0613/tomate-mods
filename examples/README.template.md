# Tomate Mods

Tomate Mods is a common abstraction layer over the Modrinth and Curseforge api 

---

## Setup
{{setup}}

## Searching
Query parameters can be generated automatically (See [here](#query-parameters)) or manually specified
- https://docs.modrinth.com/api/operations/searchprojects/#query-parameters
- https://docs.curseforge.com/rest-api/#search-mods

{{searching}}

## Project
{{project}}

## Versions
### Get all versions
{{versions}}

### Filtering versions
Query parameters can be generated automatically (See [here](#query-parameters)) or manually specified
- https://docs.modrinth.com/api/operations/getprojectversions/#query-parameters
- https://docs.curseforge.com/rest-api/#get-mod-files

{{filtering-versions}}


### Get a specific version by id
{{version}}

## Downloading
{{downloading}}

Some CurseForge-hosted mods do not support direct API downloads. In these cases, you can specify a `popup` handler to open the mod's download page in a browser as a fallback.  
See the [electron popup example](./examples/popup.ts).

## Find version from file
{{file}}

## Query Parameters
{{query-parameters}}

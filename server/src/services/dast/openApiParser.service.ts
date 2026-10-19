import type { OpenApiEndpointDefinition } from '../../modules/dast/dast.types.js';

export class OpenApiParserService {
  public parseSpecification(rawSpecJson: string): ReadonlyArray<OpenApiEndpointDefinition> {
    const parsedObject = this.safeJsonParse(rawSpecJson);
    if (!parsedObject || !parsedObject.paths) {
      return [];
    }

    const endpointDefinitions: OpenApiEndpointDefinition[] = [];
    const pathEntries = Object.entries(parsedObject.paths as Record<string, Record<string, unknown>>);

    for (const [path, methods] of pathEntries) {
      this.extractEndpointsFromPath(path, methods, endpointDefinitions);
    }

    return Object.freeze(endpointDefinitions);
  }

  private extractEndpointsFromPath(
    path: string,
    methods: Record<string, unknown>,
    accumulator: OpenApiEndpointDefinition[]
  ): void {
    const validHttpVerbs = ['get', 'post', 'put', 'delete', 'patch'];

    for (const [verb, details] of Object.entries(methods)) {
      if (!validHttpVerbs.includes(verb.toLowerCase())) continue;

      const endpointDetails = details as { parameters?: Array<Record<string, unknown>> };
      accumulator.push({
        path,
        method: verb.toUpperCase() as OpenApiEndpointDefinition['method'],
        parameters: this.mapParameters(endpointDetails.parameters || []),
      });
    }
  }

  private mapParameters(parameters: Array<Record<string, unknown>>) {
    return parameters.map((param) => ({
      name: String(param.name || ''),
      in: (param.in as 'path' | 'query' | 'header' | 'body') || 'query',
      required: Boolean(param.required),
      schemaType: String(param.type || 'string'),
    }));
  }

  private safeJsonParse(jsonString: string): Record<string, unknown> | null {
    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  }
}
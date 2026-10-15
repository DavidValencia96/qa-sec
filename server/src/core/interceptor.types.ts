export interface InterceptedRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  postData: string | null;
  resourceType: string;
  timestamp: number;
}

export interface InterceptedResponse {
  requestId: string;
  url: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string | null;
  timestamp: number;
}

export type MutationCallback = (
  routeRequest: InterceptedRequest
) => Promise<Record<string, unknown> | null>;
import { Request, Response } from 'playwright';
import { InterceptedRequest, InterceptedResponse } from '../interceptor.types.js';
import { generateUniqueId } from '../../utils/id.generator.js';

export const formatTargetUrl = (url: string): string => {
  let formattedUrl = url.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = `https://${formattedUrl}`;
  }
  return formattedUrl;
};

export const parseRouteRequest = (request: Request): InterceptedRequest => {
  return {
    id: generateUniqueId(),
    url: request.url(),
    method: request.method(),
    headers: request.headers(),
    postData: request.postData(),
    resourceType: request.resourceType(),
    timestamp: Date.now(),
  };
};

export const parseResponseData = async (response: Response): Promise<InterceptedResponse> => {
  let bodyText: string | null = null;
  try {
    bodyText = await response.text();
  } catch {
    bodyText = null;
  }
  return {
    requestId: generateUniqueId(),
    url: response.url(),
    status: response.status(),
    statusText: response.statusText(),
    headers: response.headers(),
    body: bodyText,
    timestamp: Date.now(),
  };
};
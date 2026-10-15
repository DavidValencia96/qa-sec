export interface CreateProjectDTO {
  name: string;
  targetUrl: string;
  description?: string;
}

export interface RunTestDTO {
  suiteId: string;
  targetUrl: string;
}

export interface GenerateSuitePromptDTO {
  projectId: string;
  userPrompt: string;
}
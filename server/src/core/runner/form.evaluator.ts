import { Page, Response } from 'playwright';
import { FormContextMap } from './form.discovery.js';

export interface FormExecutionResult {
  selector: string;
  type: string;
  httpStatus: number;
  responseBody: string;
  detail: string;
}

async function fillContextFields(requiredFields: Array<{ locator: any; valueToFill: string }>): Promise<void> {
  for (const item of requiredFields) {
    await item.locator.fill(item.valueToFill).catch(() => {});
  }
}

async function markRequiredCheckboxes(checkboxes: any[]): Promise<void> {
  for (const cb of checkboxes) {
    await cb.check({ force: true }).catch(() => {});
  }
}

async function triggerSubmitAndListen(page: Page, contextMap: FormContextMap): Promise<number> {
  let status = 200;
  const listener = (res: Response) => { status = res.status(); };
  page.once('response', listener);

  if (contextMap.submitButton) {
    await contextMap.submitButton.click().catch(() => {});
  } else {
    await contextMap.targetLocator.press('Enter').catch(() => {});
  }

  await page.waitForTimeout(1000);
  return status;
}

export async function executeFormTransaction(
  page: Page,
  contextMap: FormContextMap,
  targetInput: { value: string; type: string }
): Promise<FormExecutionResult> {
  await fillContextFields(contextMap.requiredFields);
  await markRequiredCheckboxes(contextMap.checkboxesToMark);

  const httpStatus = await triggerSubmitAndListen(page, contextMap);

  return {
    selector: targetInput.value,
    type: targetInput.type,
    httpStatus,
    responseBody: `Respuesta de red interceptada con código de estado ${httpStatus}.`,
    detail: httpStatus >= 500
      ? 'El servidor retornó un error 500. Se recomienda configurar un manejador de excepciones neutro.'
      : 'Formulario procesado correctamente en el cliente/servidor.'
  };
}
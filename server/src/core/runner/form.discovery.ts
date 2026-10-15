import { Page, Locator } from 'playwright';
import { TargetSelector, buildPlaywrightLocator } from './runner.helpers.js';
import { resolveValueForInputType } from './form.context.js';

export interface FormContextMap {
  targetLocator: Locator;
  requiredFields: Array<{ locator: Locator; valueToFill: string }>;
  submitButton: Locator | null;
  checkboxesToMark: Locator[];
}

async function findSubmitButton(page: Page): Promise<Locator | null> {
  const submitSelector = 'button[type="submit"], input[type="submit"], button:has-text("Send"), button:has-text("Enviar"), button:has-text("Submit")';
  const btn = page.locator(submitSelector).first();
  return (await btn.count()) > 0 ? btn : null;
}

async function mapRequiredInputs(page: Page, targetSelectorValue: string): Promise<Array<{ locator: Locator; valueToFill: string }>> {
  const requiredInputs = page.locator('input[required], textarea[required], select[required]');
  const count = await requiredInputs.count();
  const mapped = [];

  for (let i = 0; i < count; i++) {
    const item = requiredInputs.nth(i);
    const idAttr = (await item.getAttribute('id')) || '';
    const nameAttr = (await item.getAttribute('name')) || '';
    const typeAttr = (await item.getAttribute('type')) || '';

    // Ignorar si es el mismo campo objetivo que auditaremos
    if (idAttr.includes(targetSelectorValue) || nameAttr.includes(targetSelectorValue)) continue;

    const fillVal = resolveValueForInputType(typeAttr, nameAttr);
    mapped.push({ locator: item, valueToFill: fillVal });
  }
  return mapped;
}

async function mapRequiredCheckboxes(page: Page): Promise<Locator[]> {
  const checkboxes = page.locator('input[type="checkbox"]');
  const count = await checkboxes.count();
  const toCheck = [];

  for (let i = 0; i < count; i++) {
    const cb = checkboxes.nth(i);
    if (await cb.isVisible()) toCheck.push(cb);
  }
  return toCheck;
}

export async function discoverFormStructure(page: Page, targetInput: TargetSelector): Promise<FormContextMap> {
  const targetLocator = buildPlaywrightLocator(page, targetInput);
  const requiredFields = await mapRequiredInputs(page, targetInput.value);
  const submitButton = await findSubmitButton(page);
  const checkboxesToMark = await mapRequiredCheckboxes(page);

  return { targetLocator, requiredFields, submitButton, checkboxesToMark };
}
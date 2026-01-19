# Add Internationalization

Add i18n support for a new feature or component in both English and Arabic.

## Steps

1. **Identify Text Strings**
   - Find all hardcoded text in components
   - Identify user-facing strings
   - Note dynamic strings that need interpolation

2. **Add Translation Keys**
   - Location: `apps/web/locales/{locale}/common.json`
   - Use nested structure for organization
   - Follow existing key naming conventions
   - Add keys for both `en` and `ar` locales

3. **Update Server Components**
   - Use `getTranslations` from `next-intl/server`
   - Replace hardcoded strings with `t('key')`
   - Handle pluralization if needed
   - Use interpolation for dynamic values

4. **Update Client Components**
   - Use `useTranslations` hook from `next-intl`
   - Replace hardcoded strings with `t('key')`
   - Handle pluralization if needed

5. **Update API Responses**
   - Ensure API returns locale-agnostic data
   - Translate user-facing messages in frontend
   - Keep technical messages in English

6. **Test Both Locales**
   - Verify all text appears correctly in English
   - Verify all text appears correctly in Arabic
   - Check RTL layout for Arabic
   - Test text interpolation

## Translation Key Structure

```json
{
  "featureName": {
    "title": "Feature Title",
    "description": "Feature Description",
    "actions": {
      "create": "Create",
      "update": "Update",
      "delete": "Delete"
    },
    "messages": {
      "success": "Operation completed successfully",
      "error": "An error occurred"
    }
  }
}
```

## Code Examples

```typescript
// Server Component
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('featureName');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}

// Client Component
'use client';
import { useTranslations } from 'next-intl';

export function Component() {
  const t = useTranslations('featureName');
  
  return (
    <button>{t('actions.create')}</button>
  );
}
```

## Requirements

- All user-facing text must be translatable
- Use descriptive key names
- Maintain consistent structure
- Test both locales
- Handle RTL for Arabic
- Use interpolation for dynamic values

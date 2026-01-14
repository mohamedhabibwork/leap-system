---
name: Course Detail UI Refresh
overview: Refresh the existing course details page to a LinkedIn Learning-style layout with full details and bilingual (EN/AR) copy, while keeping existing data hooks and behavior intact.
todos:
  - id: layout-refresh
    content: Update layout to LinkedIn-style hero + sidebar CTA.
    status: completed
  - id: section-content
    content: Add overview/curriculum/instructor/reviews sections.
    status: completed
    dependencies:
      - layout-refresh
  - id: i18n-strings
    content: Add EN/AR translation keys for course details UI.
    status: completed
    dependencies:
      - layout-refresh
---

# Course Detail UX/UI Refresh

## Scope

- Update the existing course details view at `apps/web/app/[locale]/(hub)/hub/courses/[id]/course-detail-client.tsx` to a LinkedIn Learning-like layout (hero header, structured sections, right-side CTA card) with full details: overview, curriculum, instructor, reviews, and resources.
- Replace hardcoded strings with next-intl translation keys, adding EN/AR content in `apps/web/locales/en.json` and `apps/web/locales/ar.json`.

## Plan

1. **Restructure the layout**

- Rework the main page into a two-column layout: left content (hero, about/skills, curriculum, instructor, reviews, resources) and right sticky CTA card (price, enroll, share/favorite).
- Keep existing data hooks (`useCourse`, `useCourseLessons`, `useEnrollmentWithType`, `useCourseResources`) and interactive components (enroll modal/button, share/favorite, comments).

2. **Add LinkedIn Learning-style content sections**

- Build sections for: course overview/summary, what you’ll learn, requirements, curriculum list (with locked badges), instructor bio card, and reviews.
- Add lightweight local components inside the file or extract to `apps/web/components/courses/` if the file grows past ~200 lines.

3. **Internationalize all UI strings**

- Replace hardcoded text in the course details UI with `useTranslations('courses')` keys.
- Add required EN/AR strings under `courses.details.*` in `apps/web/locales/en.json` and `apps/web/locales/ar.json`.

4. **Polish for UX**

- Add empty states for missing outcomes/requirements/resources using translations.
- Ensure RTL-friendly spacing using logical Tailwind utilities (`ms-*`, `me-*`, `rounded-s-*`, `rounded-e-*`) where needed.

## Implementation Todos

- **layout-refresh**: Update `course-detail-client.tsx` to the LinkedIn-style layout with hero + CTA sidebar.
- **section-content**: Add or extract sections for overview, curriculum, instructor, reviews, resources.
- **i18n-strings**: Add and wire translation keys in `apps/web/locales/en.json` and `apps/web/locales/ar.json`.
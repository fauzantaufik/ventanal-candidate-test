# US-07: Anonymous Visitor Searches the Directory

**As an** anonymous visitor, **I want to** search and browse businesses from a Google Reviews–style directory homepage **so that** I can quickly discover trustworthy local services.

## Flow Diagram

```
[Anonymous Visitor]
        |
        v
   Lands on Homepage
        |
        v
 Sees prominent search bar
        |
        v
Enters business name/keyword
 + optional category filter
        |
   +----+----+
   |         |
 No matches  Matches found
   |         |
   v         v
Empty state  Scan result cards
+ clear CTA  (rating, reviews,
              badge, city)
                 |
                 v
          Open business profile
```

## INVEST Validation

- **I**ndependent: ✅ Can be delivered as a homepage UX improvement without changing auth flows
- **N**egotiable: ✅ Visual layout can vary as long as search-first discovery is clear
- **V**aluable: ✅ Helps visitors find relevant businesses faster
- **E**stimable: ✅ Mostly contained to the existing listing flow plus one query enhancement
- **S**mall: ✅ Focused on homepage search and discovery only
- **T**estable: ✅ Clear outcomes for search, empty, error, and filtered states

## Acceptance Criteria

- [ ] Homepage shows a prominent search bar above the category filters and business results
- [ ] Visitors can search businesses by partial name or descriptive keyword
- [ ] Search can be combined with the existing category filter
- [ ] Search state persists in the URL so the page is refresh-safe and shareable
- [ ] Matching business cards surface rating, review count, city, and verification status clearly
- [ ] Empty search results show a Spanish no-results state with a clear reset action
- [ ] Error and loading states remain clear and usable during search
- [ ] Results preserve the current trust-first ordering: verified businesses first, then best-rated

## Related Functional Requirements

- FR-10: The system shall provide a prominent homepage search entry point for business discovery
- FR-11: The system shall filter businesses by partial name or description using case-insensitive matching
- FR-12: The system shall allow search and category filters to work together in the same listing flow
- FR-13: The system shall preserve active search state in URL query parameters for refresh and sharing
- FR-14: The system shall show business trust signals (rating, review count, verified status, city) directly in search results

## Related Non-Functional Requirements

- NFR-06: Search must reuse the existing paginated business listing flow without breaking performance or pagination metadata
- NFR-07: Search labels, placeholders, and empty/error states must be Spanish-first and easy to scan
- NFR-08: The homepage must keep the State Triad pattern for loading, error, and data/empty states during search
- NFR-09: The search UI should feel warm, local, and familiar without copying Google branding directly

## Implementation Design

- See [US-07 Design](../design/US-07.md) for the search contract, homepage layout changes, and verification plan.

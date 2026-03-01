# Acceptance Criteria: Website Navbar
FEATURE:  navbar
SPEC:     .framework/features/navbar/feature-spec.md
CREATED:  2026-02-28
STATUS:   DRAFT

***

## Criteria

---

### FAC-navbar-01a
**Home page exposes a link to the blog**

GIVEN a visitor has navigated to the home page (`/`)
WHEN  the visitor views the page
THEN  the navbar displays a link to the blog index (`/blog`)

---

### FAC-navbar-01b
**Home page exposes a link to the dashboard**

GIVEN a visitor has navigated to the home page (`/`)
WHEN  the visitor views the page
THEN  the navbar displays a link to the dashboard (`/dashboard`)

---

### FAC-navbar-02a
**Blog pages expose a link to the home page**

GIVEN a visitor has navigated to any blog page (`/blog` or `/blog/[slug]`)
WHEN  the visitor views the page
THEN  the navbar displays a link to the home page (`/`)

---

### FAC-navbar-02b
**Blog pages expose a link to the dashboard**

GIVEN a visitor has navigated to any blog page (`/blog` or `/blog/[slug]`)
WHEN  the visitor views the page
THEN  the navbar displays a link to the dashboard (`/dashboard`)

---

### FAC-navbar-03a
**Navbar is fully visible at 375px**

GIVEN a visitor has navigated to a non-dashboard page on a 375px-wide viewport
WHEN  the visitor views the page
THEN  the navbar is fully visible with no part of it clipped or hidden

---

### FAC-navbar-03b
**No horizontal scrollbar at 375px**

GIVEN a visitor has navigated to a non-dashboard page on a 375px-wide viewport
WHEN  the visitor views the page
THEN  no horizontal scrollbar is present on the page

---

### FAC-navbar-04
**Navbar does not overlap page content at 375px**

GIVEN a visitor has navigated to a non-dashboard page on a 375px-wide viewport
WHEN  the visitor views the page
THEN  the navbar does not overlap any page content below it

***

## Traceability

| ID              | Feature Spec Section            | Success Condition                                                              |
|-----------------|---------------------------------|--------------------------------------------------------------------------------|
| FAC-navbar-01a  | Section 4 — Success Conditions  | Visitor on home page can reach the blog via navbar                             |
| FAC-navbar-01b  | Section 4 — Success Conditions  | Visitor on home page can reach the dashboard via navbar                        |
| FAC-navbar-02a  | Section 4 — Success Conditions  | Visitor on any blog page can reach home via navbar                             |
| FAC-navbar-02b  | Section 4 — Success Conditions  | Visitor on any blog page can reach the dashboard via navbar                    |
| FAC-navbar-03a  | Section 4 — Success Conditions  | Navbar visible and accessible at 375px — no navbar content clipped or hidden   |
| FAC-navbar-03b  | Section 4 — Success Conditions  | Navbar visible and accessible at 375px — no horizontal scrolling               |
| FAC-navbar-04   | Section 4 — Success Conditions  | Navbar visible and accessible at 375px — no content overlap                    |

***

## Notes

FAC-navbar-01a/01b are split from a single success condition (home page navbar) in accordance with the atomic rule — two distinct Then outcomes (blog link presence; dashboard link presence).

FAC-navbar-02a/02b are split from a single success condition (blog page navbar) by the same rule — two distinct Then outcomes (home link presence; dashboard link presence).

FAC-navbar-03a/03b are split from a single success condition ("visible and usable on a mobile screen without horizontal scrolling **or** overlapping content") by the same rule — two distinct Then outcomes (navbar visibility; absence of horizontal scrollbar). FAC-navbar-04 covers the third outcome from that condition (no content overlap) and is unchanged.

Dashboard exclusion from navbar is enforced by scope (Section 2 OUT OF SCOPE) and is not a user-observable AC for this feature. It is an implementation constraint for the task agent.

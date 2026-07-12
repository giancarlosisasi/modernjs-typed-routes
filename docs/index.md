---
pageType: home

hero:
  name: modernjs-typed-routes
  text: Type-safe routes for Modern.js
  tagline: Generated route types + typed Link, Navigate and useNavigate. Path typos and missing params become compile errors.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/giancarlosisasi/modernjs-typed-routes

features:
  - title: Zero config
    details: Add one plugin to modern.config.ts. Types regenerate automatically on every route change, in dev and build.
    icon: ⚡
  - title: Every convention covered
    details: Dynamic [id], optional [id$], splat $, pathless __layouts, flat a.b.c segments, config routes and multi-entry apps — derived from Modern.js's own route parser, not a re-implementation.
    icon: 🗺️
  - title: Typed navigation, not just types
    details: Ships typed Link, Navigate and useNavigate wrappers. Paramless routes accept a plain string; routes with params require them — autocompleted and typechecked.
    icon: 🛡️
  - title: Zero runtime cost
    details: Generates a single .d.ts file — declaration merging does the rest. Nothing is added to your bundle beyond tiny static wrappers.
    icon: 🪶
  - title: CI friendly
    details: npx modern typegen generates types without a dev server, so `typegen && tsc --noEmit` catches broken links in CI.
    icon: ✅
  - title: Escape hatches included
    details: Full re-export of @modern-js/runtime/router, originalNavigate for raw navigation, and a RoutePathname union for your own APIs.
    icon: 🔓
---

## See it in action

![Demo: route autocomplete, typo'd path error, required params](/demo.gif)

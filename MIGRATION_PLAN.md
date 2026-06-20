# Loudspeaker Design App - Migration Plan
## Recreating Ionic/AngularJS App in Next.js/React

### Executive Summary
This document outlines the complete migration from the Ionic/AngularJS app (in `oldapp/`) to a modern Next.js/React application. The app is a loudspeaker enclosure design tool that calculates Thiele-Small parameters, designs ported and sealed enclosures, and simulates SPL response curves.

---

## Current State Analysis

### ✅ What's Already Implemented (React App)
- **Driver Management**: Full CRUD operations for speaker drivers
- **Driver Calculations**: Complete Thiele-Small parameter calculations (ported enclosures)
- **Design Management**: Basic design CRUD with driver selection
- **Store (Zustand)**: State management with localStorage persistence
- **Types**: TypeScript interfaces for Driver and Design
- **Navigation**: Tab-based navigation structure
- **Chart Component**: ResponseCurve component with Chart.js
- **Unit System**: Hook for switching between metric (cm) and imperial (in)
- **Import Feature**: JSON import for drivers

### ❌ What's Missing or Incomplete
1. **Simulate Tab**: Currently just a stub - needs full implementation
2. **Sealed Enclosure Calculations**: Modeling for sealed boxes (NEW FEATURE)
3. **Port Calculations UI**: Not fully exposed in the Design form
4. **Box Dimension Calculator**: Backend exists, UI incomplete
5. **Design Detail View**: Missing detailed parameter display
6. **Response Curve on Simulate**: Multi-design comparison chart
7. **Settings/Preferences**: Unit system toggle UI
8. **Data Export**: Export designs/drivers to JSON
9. **Design Templates**: Pre-configured starting points
10. **Mobile Responsiveness**: Polish for tablet/mobile

---

## Migration Roadmap

### Phase 1: Core Functionality Completion
**Goal**: Match feature parity with oldapp for ported enclosures

#### 1.1 Complete Simulate Tab ⭐ HIGH PRIORITY
**Files**: `app/(tabs)/simulate/page.tsx`

**Tasks**:
- Display list of all designs with toggle checkboxes (like oldapp)
- Show design details: name, driver, type, Vb, Fb
- Toggle designs on/off to show/hide on response curve chart
- Display multi-dataset chart with different colors per design
- Add legend showing which design is which color
- Implement data persistence for which designs are "simulated"

**Data Flow**:
```
designs[] → filter by isDisplayed → map to chart datasets → ResponseCurve
```

**UI Layout**:
```
┌─────────────────────────────────────────┐
│         Response Curve Chart            │
│  (All toggled designs on one chart)     │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ □ Design 1: 2x15" Ported 45Hz          │
│ ☑ Design 2: 1x12" Ported 40Hz          │
│ ☑ Design 3: 4x8" Sealed 80Hz           │
└─────────────────────────────────────────┘
```

#### 1.2 Enhance Design Detail Page ⭐ HIGH PRIORITY
**Files**: `app/(tabs)/design/[designId]/page.tsx`

**Tasks**:
- Full form for editing design parameters
- Port dimension calculator (diameter, width, height, length)
- Box dimension calculator (width, height, depth)
- Show recommended vs actual values
- Real-time recalculation as values change
- Display all calculated parameters (A, B, C, D, E coefficients)
- Unit system toggle (cm ↔ in)
- Responsive layout for complex form

**Form Sections**:
1. **Basic Info**: Name, Driver selection, Type (Ported/Sealed)
2. **Driver Count**: Number of drivers (1-8), Number of ports (1-8)
3. **Enclosure Volume**: Vb (liters), recommended Vb shown
4. **Tuning Frequency**: Fb (Hz), recommended Fb shown (ported only)
5. **Port Design**: Diameter/dimensions, length calculation (ported only)
6. **Box Dimensions**: Width, height, depth with material thickness
7. **Response Curve**: Live preview chart for this design

#### 1.3 Complete Port & Box Calculations UI
**Files**: `app/components/DesignForm.tsx`, `app/components/DesignFormEmbedded.tsx`

**Tasks**:
- Expose all port calculation fields from `calculations.ts`
- Show recommended minimum port diameter (dmin)
- Calculate port length (lv) based on Vb, Fb, port area
- Box depth calculator considering port length, bracing, driver displacement
- Add validation to prevent invalid configurations
- Tooltips explaining each parameter

---

### Phase 2: Sealed Enclosure Support (NEW FEATURE)
**Goal**: Add sealed enclosure modeling (not in oldapp)

#### 2.1 Sealed Enclosure Calculations ⭐ NEW FEATURE
**Files**: `app/lib/calculations.ts`

**Tasks**:
- Implement sealed box transfer function (already started)
- Calculate Qtc (total Q in closed box)
- Calculate Fc (resonance frequency in closed box)
- Calculate F3 (-3dB point for sealed box)
- SPL response curve for sealed alignments:
  - Butterworth (Qtc = 0.707)
  - Bessel (Qtc = 0.577) - currently implemented
  - Critically damped (Qtc = 0.5)
- Box dimension calculator for sealed enclosures

**Formula Reference** (from oldapp):
```javascript
// Sealed transfer function
Fn2 = (F/Fs)^2
Fn4 = Fn2^2
Alpha = 1 + Vas/Vb
Qtc = Qts * sqrt(Alpha)
dBmag = 10 * log10(Fn4 / ((Fn4 - Alpha*Fn2 + 1)^2 + (Fn2/Qtc)^2))
```

#### 2.2 Sealed Design UI
**Files**: `app/(tabs)/design/[designId]/page.tsx`

**Tasks**:
- Conditional form fields based on type (Ported vs Sealed)
- Hide port fields when Sealed is selected
- Show sealed-specific parameters: Qtc, Fc, F3
- Display recommended sealed volume from driver parameters
- Show alignment type selection (Butterworth, Bessel, etc.)

---

### Phase 3: Enhanced Features & UX

#### 3.1 Design Templates
**Files**: `app/lib/seedData.ts`, `app/(tabs)/design/page.tsx`

**Tasks**:
- Create template designs for common configurations:
  - Small bookshelf (1x6.5" sealed)
  - PA subwoofer (1x18" ported)
  - Line array element (2x8" ported)
  - Car audio (1x12" sealed)
- "Create from Template" button
- Template browser/picker modal

#### 3.2 Import/Export System
**Files**: Create `app/components/ExportModal.tsx`, `app/components/ImportModal.tsx`

**Tasks**:
- Export all designs to JSON
- Export single design to JSON
- Export all drivers to JSON
- Import designs from JSON
- Import drivers from JSON (already exists)
- Validate imported data structure
- Merge vs replace options

#### 3.3 Settings & Preferences
**Files**: Create `app/(tabs)/settings/page.tsx`

**Tasks**:
- Default unit system (metric/imperial)
- Default design type (ported/sealed)
- Chart appearance settings
- Data management: Clear all, Export all, Import
- About/version info

#### 3.4 Design Comparison View
**Files**: Create `app/(tabs)/compare/page.tsx` or enhance Simulate

**Tasks**:
- Side-by-side parameter comparison table
- Highlight differences
- Compare efficiency, SPL, box size
- Recommend best design for specific criteria

---

### Phase 4: Polish & Optimization

#### 4.1 Mobile Responsiveness
**Files**: All UI components

**Tasks**:
- Optimize for tablet (landscape/portrait)
- Optimize for mobile (single column layout)
- Touch-friendly controls
- Collapsible sections for complex forms
- Responsive chart sizing

#### 4.2 Visual Enhancements
**Files**: `app/globals.css`, component styling

**Tasks**:
- Consistent color scheme
- Better visual hierarchy
- Loading states
- Error states with helpful messages
- Success notifications
- Icon system (driver icons, design type icons)

#### 4.3 Performance Optimization
**Files**: Various

**Tasks**:
- Memoize expensive calculations
- Debounce input fields that trigger recalculation
- Virtualize long lists (if >50 drivers/designs)
- Code splitting for chart library
- Optimize chart render performance

#### 4.4 Data Validation & Error Handling
**Files**: `app/lib/calculations.ts`, form components

**Tasks**:
- Validate driver parameters (e.g., Qts > 0)
- Warn about unrealistic designs (e.g., Vb too small)
- Prevent division by zero in calculations
- Graceful degradation if calculations fail
- User-friendly error messages

---

## Technical Decisions

### Keep from Current Implementation ✅
1. **Next.js 14+** with App Router - Modern, performant
2. **Zustand** for state management - Simple, works well
3. **TypeScript** - Type safety for complex calculations
4. **Tailwind CSS** - Fast styling, responsive utilities
5. **Chart.js** via react-chartjs-2 - Proven, feature-rich
6. **localStorage** for persistence - Simple, works offline

### Changes to Consider 🤔
1. **Form Library**: Add `react-hook-form` for complex design forms?
   - Pro: Better validation, less boilerplate
   - Con: Additional dependency
   - **Decision**: Add for design detail form only

2. **Validation**: Add `zod` for runtime type checking?
   - Pro: Catch invalid data from imports
   - Con: Overhead, TypeScript already helps
   - **Decision**: Add for import validation only

3. **UI Components**: Add `shadcn/ui` or similar?
   - Pro: Consistent, accessible components
   - Con: Learning curve, bundle size
   - **Decision**: Build custom components, borrow patterns

---

## File Structure (Proposed)

```
app/
├── (tabs)/
│   ├── design/
│   │   ├── page.tsx              [List view - ENHANCE]
│   │   ├── [designId]/
│   │   │   └── page.tsx          [Detail view - MAJOR WORK]
│   │   └── new/
│   │       └── page.tsx          [Create - exists]
│   ├── driver/
│   │   └── page.tsx              [List view - ✅ DONE]
│   ├── simulate/
│   │   └── page.tsx              [Comparison - IMPLEMENT]
│   ├── compare/                  [NEW - Phase 3]
│   │   └── page.tsx
│   └── settings/                 [NEW - Phase 3]
│       └── page.tsx
├── components/
│   ├── DesignForm.tsx            [ENHANCE]
│   ├── DesignFormEmbedded.tsx    [ENHANCE]
│   ├── DriverForm.tsx            [✅ DONE]
│   ├── ResponseCurve.tsx         [ENHANCE - logarithmic scale]
│   ├── ExportModal.tsx           [NEW]
│   ├── ImportModal.tsx           [NEW]
│   ├── TemplateSelector.tsx      [NEW]
│   └── ParameterDisplay.tsx      [NEW]
├── lib/
│   ├── calculations.ts           [ENHANCE - sealed boxes]
│   ├── types.ts                  [ENHANCE - add sealed fields]
│   ├── store.tsx                 [ENHANCE - add compare state]
│   ├── seedData.ts               [ENHANCE - add templates]
│   └── validation.ts             [NEW - data validation]
└── globals.css                   [REFINE]
```

---

## Priority Breakdown

### Must Have (MVP) - 2-3 days
1. ✅ Complete Simulate tab with multi-design chart
2. ✅ Enhanced Design detail form with all parameters
3. ✅ Port calculation UI (diameter, length, area)
4. ✅ Box dimension calculator UI

### Should Have - 1-2 days
5. ⭐ Sealed enclosure calculations and UI (NEW FEATURE)
6. ✅ Export functionality
7. ✅ Mobile responsive design
8. ✅ Better error handling and validation

### Nice to Have - 1 day
9. 🎨 Design templates
10. 🎨 Settings page
11. 🎨 Design comparison table
12. 🎨 Visual polish and animations

---

## Testing Strategy

### Manual Testing Checklist
- [ ] Create driver, verify all calculated parameters
- [ ] Create ported design, verify port calculations
- [ ] Create sealed design, verify sealed calculations (NEW)
- [ ] Toggle designs on simulate tab
- [ ] Edit design, verify recalculation
- [ ] Import/export data
- [ ] Switch unit systems
- [ ] Test on mobile device
- [ ] Test offline functionality (localStorage)

### Edge Cases to Test
- [ ] Driver with invalid parameters (Qes = 0)
- [ ] Very small Vb (< 1 liter)
- [ ] Very large Vb (> 1000 liters)
- [ ] Multiple drivers (2-8)
- [ ] Multiple ports (2-8)
- [ ] Extreme frequencies (< 10 Hz, > 1000 Hz)

---

## Migration Notes

### Key Differences from oldapp
1. **No jQuery/AngularJS dependencies** - React replaces these
2. **No Ionic UI components** - Custom Tailwind UI
3. **localStorage API directly** - No ngStorage wrapper needed
4. **React hooks** replace Angular controllers/services
5. **Zustand** replaces Angular services for state
6. **Type safety** from TypeScript catches errors earlier

### Calculations Ported Successfully ✅
- Driver TS parameter calculations
- Ported enclosure transfer function
- SPL response curve generation
- Port diameter (dmin) calculation
- Port length (lv) calculation
- Box dimension calculation
- Multi-driver scaling

### Calculations Still Needed ⚠️
- Sealed enclosure transfer function (partially done)
- Sealed enclosure Qtc calculation
- Sealed enclosure F3 calculation
- Box material thickness consideration
- Driver excursion-limited SPL

---

## Risk Assessment

### Low Risk ✅
- Driver management (already working)
- Basic design CRUD (already working)
- Chart rendering (already working)
- Data persistence (already working)

### Medium Risk ⚠️
- Sealed enclosure math (new feature, needs testing)
- Complex form state management (debouncing needed)
- Mobile UX (requires testing on devices)

### High Risk 🚨
- Data migration from oldapp (if users have existing data)
  - **Mitigation**: Build import tool from oldapp localStorage export
- Calculation bugs in edge cases
  - **Mitigation**: Extensive testing with known good designs

---

## Questions for Review

1. **Sealed Enclosure Priority**: Should sealed enclosures be in Phase 1 (MVP) or Phase 2?
   - **Recommendation**: Phase 2, since oldapp didn't have it

2. **Unit System Default**: Should we default to metric or imperial?
   - **Recommendation**: Metric (SI units), with toggle

3. **Data Migration**: Do we need to support importing oldapp data?
   - **Recommendation**: Yes, build import from oldapp JSON export

4. **Chart Library**: Stick with Chart.js or explore alternatives?
   - **Recommendation**: Keep Chart.js, well-tested

5. **Authentication**: Will this need user accounts in the future?
   - **Recommendation**: Start without, can add later if needed

---

## Success Criteria

The migration is complete when:
- ✅ All features from oldapp are replicated or improved
- ✅ Sealed enclosure calculations work correctly
- ✅ App works offline with localStorage
- ✅ Mobile responsive on tablets and phones
- ✅ No calculation errors compared to oldapp reference designs
- ✅ User can import oldapp data
- ✅ Clean, maintainable TypeScript code
- ✅ Documentation for formulas and calculations

---

## Timeline Estimate

- **Phase 1 (Core)**: 3-4 days
- **Phase 2 (Sealed)**: 2-3 days
- **Phase 3 (Features)**: 2-3 days
- **Phase 4 (Polish)**: 2-3 days

**Total**: 9-13 days of focused development

---

## Next Steps

1. **Review this plan** - Confirm priorities and scope
2. **Set up task tracking** - Break down into individual tickets
3. **Start with Phase 1.1** - Simulate tab (highest user value)
4. **Iterative testing** - Test after each phase
5. **User feedback** - Get input after Phase 1 complete

---

*Document created: 2026-06-20*
*Last updated: 2026-06-20*

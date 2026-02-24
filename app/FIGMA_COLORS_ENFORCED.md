# Figma Color Palette - ENFORCED ✅

**Source**: `/Users/samuelsaha/Downloads/export/Header-*.png`
**Extraction Date**: February 24, 2026
**Status**: Colors extracted from actual Figma exports and enforced in code

---

## 🎨 EXACT COLORS FROM FIGMA

### Primary Brand Color
| Color Name | Hex | RGB | Tailwind | Usage |
|------------|-----|-----|----------|-------|
| **Logo Blue** | `#2563EB` | RGB(37, 99, 235) | `blue-600` | Logo icon, primary buttons, active states |
| **Button Hover** | `#1D4ED8` | RGB(29, 78, 216) | `blue-700` | Button hover states |
| **Light Blue BG** | `#DBEAFE` | RGB(219, 234, 254) | `blue-100` | Active menu items, highlights |

### Text Colors
| Color Name | Hex | RGB | Tailwind | Usage |
|------------|-----|-----|----------|-------|
| **Primary Text** | `#0F172A` | RGB(15, 23, 42) | `slate-900` | Headings, bold text |
| **Body Text** | `#475569` | RGB(71, 85, 105) | `slate-600` | Body copy, navigation |
| **Muted Text** | `#94A3B8` | RGB(148, 163, 184) | `slate-400` | Disabled, placeholders |

### Background Colors
| Color Name | Hex | RGB | Tailwind | Usage |
|------------|-----|-----|----------|-------|
| **Pure White** | `#FFFFFF` | RGB(255, 255, 255) | `white` | Cards, header background |
| **Hero Gradient Start** | `#F8FBFF` | RGB(248, 251, 255) | Custom | Hero section top |
| **Hero Gradient End** | `#F0F6FF` | RGB(240, 246, 255) | Custom | Hero section bottom |
| **Dashboard BG** | `#F4F9FF` | RGB(244, 249, 255) | Custom | Dashboard mockup area |
| **Light Section BG** | `#F8FAFC` | RGB(248, 250, 252) | `slate-50` | Section backgrounds |

### Border Colors
| Color Name | Hex | RGB | Tailwind | Usage |
|------------|-----|-----|----------|-------|
| **Default Border** | `#E2E8F0` | RGB(226, 232, 240) | `slate-200` | Card borders, dividers |
| **Input Border** | `#CBD5E1` | RGB(203, 213, 225) | `slate-300` | Form inputs, secondary borders |

### Footer Colors
| Color Name | Hex | RGB | Tailwind | Usage |
|------------|-----|-----|----------|-------|
| **Footer BG** | `#0F172A` | RGB(15, 23, 42) | `slate-900` | Footer background |
| **Footer Text Light** | `#C3C5CA` | RGB(195, 197, 202) | Custom | Footer links |
| **Footer Text Muted** | `#878B95` | RGB(135, 139, 149) | Custom | Footer secondary text |

### Status Colors
| Color Name | Hex | RGB | Tailwind | Usage |
|------------|-----|-----|----------|-------|
| **Success Green** | `#10B981` | RGB(16, 185, 129) | `emerald-500` | Approved, success states |
| **Warning Amber** | `#F59E0B` | RGB(245, 158, 11) | `amber-500` | Pending, warnings |
| **Error Red** | `#EF4444` | RGB(239, 68, 68) | `red-500` | Rejected, errors |

---

## 📐 DESIGN SPECIFICATIONS

### Typography
- **Font Family**: System font stack (SF Pro Display on macOS)
- **Heading Weight**: 700 (bold)
- **Body Weight**: 500 (medium)
- **H1 Size**: 64px / 4rem
- **Body Size**: 20px / 1.25rem

### Spacing
- **Header Height**: 72px
- **Section Padding**: 80px (5rem) vertical
- **Card Padding**: 32px (2rem)
- **Button Padding**: 12px 24px

### Border Radius
- **Buttons**: 8px (`rounded-lg`)
- **Cards**: 16px (`rounded-2xl`)
- **Logo Icon**: 8px (`rounded-lg`)
- **Badges**: 9999px (`rounded-full`)

### Shadows
- **Card Shadow**: `shadow-sm` (subtle)
- **Mockup Shadow**: `shadow-lg` (pronounced)
- **Button Shadow**: None (flat design)

---

## ⚠️ KEY DESIGN DECISIONS

### ✅ What's Enforced
1. **Minimal Borders**: Using `border` (1px) not `border-2` - Figma uses thin borders
2. **Subtle Shadows**: `shadow-sm` and `shadow-md` only - no heavy `shadow-xl`
3. **Clean Backgrounds**: Very light blue tints (`#F4F9FF`) not saturated colors
4. **No Border Boxes**: Hero content has NO decorative border - it's just centered text
5. **Flat Buttons**: No button shadows - clean, flat design

### ❌ What to Avoid
- Heavy `border-2` borders (too bold)
- `shadow-xl` shadows (too dramatic)
- Saturated background colors (design is very light)
- Decorative boxes around hero content (keep it minimal)
- Blue-tinted borders (use slate-200 for neutrality)

---

## 🔒 ENFORCEMENT CHECKLIST

- [x] Header: White background, slate-200 border
- [x] Logo: Blue-600 background, rounded-lg
- [x] Hero BG: Gradient from #F8FBFF to #F0F6FF
- [x] Dashboard Mockup: White with subtle shadow, slate-200 border
- [x] Cards: White with slate-200 borders, shadow-sm
- [x] Footer: Exact #0F172A background
- [x] Text: slate-900 headings, slate-600 body
- [x] Buttons: blue-600 with no shadow

---

## 🎯 VERIFICATION

To verify colors match Figma:
1. Open: `/Users/samuelsaha/Downloads/export/Header.png`
2. Sample logo blue: Should be `#2563EB`
3. Sample text gray: Should be `#475569`
4. Sample border: Should be `#E2E8F0`

**Last Verified**: February 24, 2026 ✅

---

## 📝 IMPLEMENTATION NOTES

### Custom Colors in Tailwind
The hero gradient uses custom hex values. Add to `tailwind.config.js` if needed:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'hero-gradient-start': '#F8FBFF',
        'hero-gradient-end': '#F0F6FF',
      }
    }
  }
}
```

### Shadow System
Figma uses very subtle shadows. Stick to:
- `shadow-sm`: Cards, most elements
- `shadow-md`: Hover states
- `shadow-lg`: Dashboard mockup only

---

**Status**: ✅ Figma colors enforced across entire landing page
**Build**: ✅ Production build verified
**Visual Match**: ✅ Matches Figma exports exactly

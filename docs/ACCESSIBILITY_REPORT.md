# Accessibility Report

## Checks completed
- Registration modal has an accessible dialog title, visible labels, keyboard-friendly controls, Escape close, and outside-click close.
- Focus-visible styling is present for buttons, inputs, selects, and textareas.
- Light-theme text contrast was corrected for dashboard cards, workflow details, AI prompt chips, placeholders, and secondary labels.
- Dark-theme and light-theme modal surfaces use opaque readable backgrounds.
- Reduced-motion class support disables transitions and repeated animations.
- English, Kannada, and Hindi landing-page strings now have fallbacks through the translation dictionary.
- Mobile carousel sizing was constrained to avoid intrinsic-width overflow.

## Browser observations
- Landing page loads without displaying the runtime error panel.
- English, Kannada, and Hindi hero text switch correctly.
- Light and dark theme switching updates the active theme.
- Administrator login opens the dashboard.
- Workflow progress updates from 0 to 1 of 15 after completing the first step.
- Desktop document width did not overflow the viewport during the tested run.

## Remaining limitations
- This is a static browser demo, so a full automated WCAG audit tool is not included.
- Some public marketing copy remains English because only the existing translation surface was expanded.
- Screen-reader testing with assistive technology must be completed separately on the target presentation device.

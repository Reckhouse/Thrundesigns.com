# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

TypeScript, Vite, and Three.js. The simulation core and persistent state remain framework-neutral. The first production slice uses a renderer-independent backend contract, with GPU backends added behind that interface.

## Users

- Creative coders evaluating the field model, implementation, and technical notes.
- Design clients exploring how a difficult idea becomes a legible interaction.
- General visitors balancing signed emitters into stable forms.
- Recruiters and engineers reviewing deterministic math, architecture, tests, and performance.

## Product Purpose

Counterspace Field Laboratory is an interactive three-dimensional field-composition instrument. Visitors place signed emitters, orient their axes, blend four documented vector-field operators, and watch particles settle into persistent geometry. Success is a memorable, inspectable equilibrium event whose seed and configuration can be reproduced.

## Positioning

An openly speculative geometry sandbox whose visual language comes from the supplied source diagrams, while its behavior comes from bounded vector calculus and deterministic numerical integration. It is an art-and-mathematics simulation, not a model of nature.

## Operating Context

Visitors arrive at a quiet chamber containing an opposed red/blue emitter pair, manipulate the field directly or through accessible controls, search for a stable form, inspect the measurements behind its classification, and save or share interesting states.

## Capabilities and Constraints

- Four named operators: Spatial, Counterspatial, Circular, and Radial.
- Up to eight physical signed emitters with bounded position, strength, reach, pressure, rotation, and normalized operator weights.
- Fixed-step deterministic simulation, finite-core forces, acceleration/velocity clamps, and non-finite recovery.
- Stability is sustained coherent motion, not zero velocity; classification includes torus, shell, crystal, and axial candidates.
- Persistent state is schema-versioned and bounded. Runtime GPU resources are never serialized.
- Responsive desktop and mobile controls, reduced-motion and low-sensory modes, equivalent non-canvas emitter controls, and non-color polarity cues.
- First implementation is a production-quality vertical slice; WebGPU/TSL and WebGL2 compute backends remain subsequent phases behind the backend contract.

## Brand Commitments

The name is “Counterspace Field Laboratory.” Required language includes “speculative geometry sandbox” and the disclosure: “This laboratory explores invented vector fields inspired by geometric diagrams. It is an art-and-mathematics simulation, not a model of real electromagnetism.” The supplied diagrams establish motifs and relationships but their philosophical/scientific claims are not reproduced.

## Evidence on Hand

- `Counterspace_Field_Laboratory_Technical_Plan.docx`: product, mathematics, interaction, rendering, architecture, test, and delivery plan.
- `img1.png` and `img2.png`: source plates for polarity, axes, toroidal return, radial marks, phi annotations, paper texture, and hand-built technical density.
- No testimonials, customers, benchmarks, or scientific validation are supplied; future work must not fabricate them.

## Product Principles

- Prove the field through manipulation and measurement rather than explanatory claims.
- Preserve mathematical boundedness, determinism, and inspectability.
- Keep the default chamber restrained; move technical density into an optional inspector.
- Make stable form attainable without hiding control changes or substituting canned animation.
- Treat accessibility, comfort, and equivalent controls as part of the instrument.

## Accessibility & Inclusion

Controls require visible labels, values, units, keyboard operation, and reset actions. Polarity combines color with signs, direction, and glyph pattern. The canvas exposes a polite text alternative. Reduced-motion and Low Sensory modes disable camera choreography, animated grain, temporal trails, rapid flashes, and unnecessary audio.

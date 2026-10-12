---
title: Wireless Power for a Cylindrical Mouse Homecage
category: RF · Research
period: Sep 2025 – Present
order: 2
summary: >-
  A 13.56 MHz wireless power design that lets an optogenetic implant on a freely moving mouse draw power
  anywhere in a round cage. After validating my HFSS method on a published system, I tested six designs;
  two horizontal ring resonators held coupling within 1.1 dB across the cage and 0.7 dB across head heights.
card_summary: A 13.56 MHz wireless power design for implants in a round mouse cage. Two ring resonators kept coupling within about 1 dB anywhere the mouse goes.
role: Research Assistant (design, simulation and report)
team: AXIS Lab, WashU · Advisor Prof. Yingying Fan
status: Simulation complete; prototype next
tags: [RF, Wireless Power, Research]
tools: [Ansys HFSS, Python, Inductive link design, S-parameter analysis]
thumbnail: /assets/projects/wpt-homecage/cover.jpg
thumbnail_alt: HFSS models of single and dual ring resonators inside a cylindrical cage
hero: /assets/projects/wpt-homecage/variants-v1-v3-v6.jpg
hero_alt: HFSS geometry of the baseline, single-ring and dual-ring designs
hero_caption: "Three of the six HFSS designs: transmit coil only (V1), one ring resonator (V3), and the final dual-ring design (V6)."
links:
  - label: Full report (PDF)
    url: /assets/projects/wpt-homecage/report.pdf
highlights:
  - value: 1.1 dB
    label: Coupling variation across the cage (V6)
  - value: 0.7 dB
    label: Variation over 30–70 mm head height, vs 11.7 dB with one ring
  - value: −17.6 dB
    label: Peak |S21| of the final design
  - value: 6
    label: Cage designs simulated and compared
---

## Overview

Wireless optogenetic implants let neuroscientists stimulate the brain of a mouse that's moving freely instead of tethered to a bench. They still need continuous power, and the power has to reach the implant wherever the mouse walks or rears. Existing wirelessly powered cages, like the EnerCage family, are all rectangular. Many behavioral experiments use round enclosures (open field arenas, water mazes, fear-conditioning chambers), and none had a power system designed for that shape.

My target was a 100 mm-diameter, 260 mm-tall cylindrical cage at the 13.56 MHz ISM frequency, powering a receive coil no larger than 10 mm at head heights of 30–70 mm, with a goal of 50 mW delivered to the implant.

## Step 1: Validate the method on a published design

Before designing anything new, I reproduced the EnerCage-HC2, a published rat homecage that uses four tilted, segmented copper-foil resonators around the cage. If my HFSS model could match its behavior, I could trust the same method on my own designs.

<div class="gallery two">
{% include figure.html src="/assets/projects/wpt-homecage/enercage-geom-baseline.jpg" caption="Baseline: transmit coil L1 under the cage, receiver at 70 mm." class="light-bg" %}
{% include figure.html src="/assets/projects/wpt-homecage/enercage-geom-resonators.jpg" caption="Full reproduction with the four tilted resonators L21–L24." class="light-bg" %}
{% include figure.html src="/assets/projects/wpt-homecage/enercage-h-baseline.jpg" caption="Baseline magnetic field at 70 mm: weak, max 0.143 A/m, concentrated at the center." class="light-bg" %}
{% include figure.html src="/assets/projects/wpt-homecage/enercage-h-resonators.jpg" caption="With resonators: 4.7× stronger (max 0.675 A/m) and spread across the cage." class="light-bg" %}
</div>

My first full model reached only −48 dB. Working through it, I found three modeling errors: one segmentation capacitor set to 1000 pF instead of 130 pF, which split the resonance into two weak peaks; a receiver resonator modeled as a zero-thickness sheet (needed to avoid mesh failures), which required retuning its capacitor; and a port that wasn't electrically connected on both sides. Fixing these and retuning brought the model to **−17.4 dB at 13.6 MHz**, a 30 dB improvement.

{% include figure.html src="/assets/projects/wpt-homecage/enercage-s21-progress.png" caption="S21 vs frequency: baseline (blue), first resonator model (green) and the final tuned reproduction (red/black), peaking near 13.56 MHz." class="light-bg" %}

The reproduction still sits about 9 dB below the paper's reported 14% efficiency. I traced that gap to known simplifications: the sheet-modeled receiver, a single-pass mesh forced by the 16 GB memory limit of the student HFSS license, a 1000 Ω load port instead of the paper's 45–89 Ω, and no matching network. The qualitative behavior matched: a clear resonance at 13.56 MHz, a much more uniform field, and the self-localizing effect where the nearest resonator dominates. That was enough to trust the method for comparing designs.

## Step 2: Six designs for a round cage

All six variants share the same 100 mm, 3-turn transmit coil at the cage bottom and a 10 mm, 8-turn receive coil.

| # | Design | Peak \|S21\| | What it showed |
|---|---|---|---|
| V1 | Transmit coil only | −30.2 dB | Baseline; far too weak on its own |
| V2 | One horizontal ring, untuned | −13.7 dB | Ring works, but resonance landed at 14.92 MHz |
| V3 | One horizontal ring, tuned | −14.6 dB | Best peak, but strong only near the ring's height |
| V4 | V3 + resonator on the receiver | −16.9 dB | Slightly worse: over-coupling adds loss |
| V5 | Three tilted rings | −30.1 dB | No better than baseline (see below) |
| V6 | Two horizontal rings | −17.6 dB | Near-uniform coupling everywhere |

{% include figure.html src="/assets/projects/wpt-homecage/cyl-s21-all-variants.png" caption="S21 vs frequency for all six variants." class="light-bg" %}

### A useful negative result: tilted rings don't work in a cylinder

The obvious first idea was to copy the EnerCage's tilted panels as tilted rings around the cylinder. In simulation they did nothing: −30.1 dB, the same as having no resonators. A tilted ring presents very little area parallel to the transmit coil at any given height, so mutual coupling stays weak. In a round cage, horizontal rings that fully overlap the transmit coil are the right topology.

{% include figure.html src="/assets/projects/wpt-homecage/v5-tilted-rings.png" caption="V5: three tilted rings at 120°, and a single tilted ring tested alone. Both matched the baseline." class="light-bg" %}

### Peak vs. uniformity

A single tuned ring (V3) gives the strongest peak, but only near its own height: coupling fell by 11.7 dB as the receiver moved from 30 to 70 mm. For a mouse that walks, rears and grooms, the weakest spot in the cage matters more than the best one.

V6 places two rings that bracket the head-height range, near 30 mm and 70 mm. Each ring dominates when the receiver is close to it, and in between their fields add. The result is a nearly flat profile: **1.1 dB** of variation across the cage radius and **0.7 dB** over the full height range. V6 gives up 3 dB of peak coupling to V3, but its worst case (−18.9 dB) is **17 dB better** than V3's (−35.8 dB).

<div class="gallery two">
{% include figure.html src="/assets/projects/wpt-homecage/homogeneity-lateral.png" caption="Moving the receiver sideways: V6 (red) stays flat; V3 (green) varies by 6 dB." class="light-bg" %}
{% include figure.html src="/assets/projects/wpt-homecage/homogeneity-height.png" caption="Moving the receiver up: V6 stays flat; V3 drops 11.7 dB." class="light-bg" %}
</div>

## How it compares

Against the reproduced EnerCage, V6 gives up almost nothing in peak coupling (−17.6 vs −17.4 dB) while covering its cage far more evenly. The EnerCage reproduction varied by more than 17 dB across its cage, with dead zones near the walls; V6 stayed within 1.1 dB.

<div class="gallery two">
{% include figure.html src="/assets/projects/wpt-homecage/cross-comparison.png" caption="Coupling vs receiver position: EnerCage reproduction (blue) vs cylindrical V6 (red)." class="light-bg" %}
{% include figure.html src="/assets/projects/wpt-homecage/summary-bars.png" caption="Summary: peak coupling (left) and spatial variation, lower is better (right)." class="light-bg" %}
</div>

At V6's −17.6 dB (a 1.74% power ratio), delivering 50 mW to the load would need roughly **3 W** of transmitter input, assuming ideal rectification and no matching losses.

## Limitations and next steps

- **Simulation only.** Absolute efficiency numbers are approximate given the 9 dB gap in the reproduction, but all designs were compared with the same method, so the ranking holds.
- **Frequency.** V6 resonates at 14.52 MHz, not 13.56 MHz; both rings need retuning together.
- **Matching.** Input reflection is poor in every design because no matching network was modeled.
- **Coverage gaps.** The radial sweep stopped 10 mm short of the wall, the receiver was always horizontal (a real mouse tilts its head), and there's no tissue model for SAR.

Next steps are a physical prototype of V6, a matching network, SAR analysis with a tissue phantom, closed-loop power control, and tests of how head tilt affects coupling.

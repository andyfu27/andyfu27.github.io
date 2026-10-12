---
title: Shift & Clutch Control Board
category: Formula SAE · PCB Design
period: 2025 – 2026
order: 3
summary: >-
  A 4-layer driver-controls board for the WashU Racing car. It reads the paddle shifters,
  clutch paddles and position sensors, fires the shift actuators, and reports to the rest of the car over CAN.
card_summary: A 4-layer Formula SAE board that reads the shift and clutch paddles and sensors, drives the shift actuators, and talks to the car over CAN.
role: Schematic capture, PCB layout and design review
team: WashU Racing electronics
status: Design complete
tags: [PCB Design, Embedded, Automotive]
tools: [Altium Designer, CAN bus, SPI, Analog front-end]
thumbnail: /assets/projects/racing-control-board/3d-angled.png
thumbnail_alt: 3D render of the control board with the microcontroller module and automotive connector
hero: /assets/projects/racing-control-board/3d-angled.png
hero_alt: 3D render of the control board
hero_caption: 3D render from Altium. The microcontroller module plugs into sockets on the left; the 26-pin sealed connector on the right carries every signal to the car.
links:
  - label: Schematic (PDF)
    url: /assets/projects/racing-control-board/schematic.pdf
highlights:
  - value: 4 layers
    label: Signal / GND / GND / Signal
  - value: 66 × 91 mm
    label: Board outline
  - value: 26 pins
    label: One sealed automotive connector for all I/O
  - value: 12-bit, 11 ch
    label: 5 V-referenced ADC for sensors
---

## Overview

The control board sits between the driver and the drivetrain. It reads the upshift and downshift paddles, both clutch paddles, and the gear and clutch position sensors, then drives the shift actuators and sends status to the rest of the car over CAN. Brake light, clutch servo and ECU signals also leave through it.

The microcontroller is a plug-in module on sockets, so firmware and hardware can be developed separately, and a damaged module can be swapped without reworking the board.

{% include figure.html src="/assets/projects/racing-control-board/block-diagram.svg" alt="Block diagram: inputs, conditioning, processing, outputs and power" caption="Signal flow through the board. Every input is conditioned before it reaches a converter, and every output goes through a driver instead of a bare MCU pin." class="scroll-x" %}

## Design decisions

### Reading 0–5 V automotive sensors on a 3.3 V microcontroller

Most car sensors swing 0–5 V, but the microcontroller runs at 3.3 V. Rather than scaling every channel down, the board uses an external **TLV2553 12-bit, 11-channel SPI ADC** with its reference tied to 5 V. The gear position sensor, clutch position sensor and five general analog inputs are read across their full range at full resolution, and each one passes through its own RC low-pass filter first.

### Clutch paddles: scale, filter, then buffer

The clutch paddles feed the microcontroller's own ADC, so they do need scaling. Each paddle goes through a 27 kΩ / 51 kΩ divider, which maps 5 V to about 3.27 V, just under the 3.3 V limit. A 100 nF capacitor across the lower resistor forms a ~90 Hz low-pass filter with the divider's 17.6 kΩ source resistance.

That source resistance is too high to drive an ADC's sampling capacitor cleanly, so each channel is followed by an **MCP6002 op-amp wired as a unity-gain buffer**.

### Shift paddles: pull-ups and filtering

The upshift and downshift paddles are switch inputs. Each has a 10 kΩ pull-up to 3.3 V and a series-R / shunt-C filter to keep harness noise from registering as a shift.

### Driving the shift actuators

Shift commands go through an **Infineon BTS3410G dual-channel smart low-side switch** instead of discrete MOSFETs. The MCU drives its inputs through 220 Ω resistors, and the switch sinks the actuator current on the low side.

### Buffered 5 V outputs

The brake light, clutch servo, ECU signal and a spare digital output are driven through an **LTV-847 quad optocoupler**. The MCU's 3.3 V pins only light an LED; the output transistors pull up from the 5 V rail. That gives clean 5 V-level signals and means a short in the harness can't reach the microcontroller directly.

### Power

The board runs from the car's 12 V supply. A 1N4004 diode blocks reverse polarity, an MC78M05 linear regulator makes the 5 V rail, and a 250 mA fuse on the regulator output limits fault current. The 3.3 V rail comes from the microcontroller module's own regulator.

## Layout

The board is a 4-layer stackup with routing on the outer layers and two solid ground pours on the inner layers, giving every signal a continuous return path. Most routing sits on the top layer; the bottom layer carries a handful of crossovers.

- The 26-pin connector sits on the board edge, with the input filters placed between it and the microcontroller.
- A wide trace carries power from the connector to the regulator.
- The CAN pair breaks out to a 3-pin header (CAN_H, GND, CAN_L) next to the module.

<div class="gallery">
{% include figure.html src="/assets/projects/racing-control-board/3d-top.png" alt="3D top view of the board" caption="3D top view." %}
{% include figure.html src="/assets/projects/racing-control-board/top-copper.png" alt="Top copper layer" caption="Top copper: most of the routing, plus the wide power trace from the connector." %}
{% include figure.html src="/assets/projects/racing-control-board/bottom-copper.png" alt="Bottom copper layer" caption="Bottom copper, seen through the board from the top." %}
</div>

## Schematic

{% include figure.html src="/assets/projects/racing-control-board/schematic.png" alt="Full schematic of the control board" caption="Full schematic: external connector, microcontroller, ADC, power, optocouplers, power switch and signal filters. Click to enlarge, or open the PDF above." class="light-bg" %}

<!--
  TODO (Andy): add a section here once you have them:
  - photos of the fabricated / assembled board, or of it installed on the car
  - bring-up or testing results (what worked, what you changed in the next revision)
  - one or two lessons learned
-->

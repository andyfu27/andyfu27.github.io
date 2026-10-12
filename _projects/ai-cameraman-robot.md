---
title: AI Cameraman Robot
category: Robotics · Internship
period: Jun – Aug 2026
order: 1
summary: >-
  A simulated ground robot that finds a person with YOLOv8, keeps them framed with a two-axis gimbal,
  and films them while following, side-tracking, orbiting or navigating indoors. Built in ROS 2 Humble
  and Gazebo during my robotics internship at Innovation AI.
card_summary: A simulated ROS 2 robot that spots a person with YOLOv8, keeps them framed with a gimbal, and follows, orbits or navigates to film them.
role: Robotics Software Engineering Intern
team: Innovation AI (remote)
status: Complete, simulation only
tags: [Robotics, Computer Vision, Controls]
tools: [ROS 2 Humble, Gazebo Fortress, Nav2, ros2_control, YOLOv8, OpenCV, PyTorch, Python, RViz2, rosbag2]
thumbnail: /assets/projects/ai-cameraman-robot/cover.jpg
thumbnail_alt: Simulated robot orbiting a person, with the camera view inset
hero_video: /assets/projects/ai-cameraman-robot/cinematic-orbit.mp4
hero: /assets/projects/ai-cameraman-robot/cinematic-orbit.jpg
hero_alt: Robot driving a 2 m orbit around a person while the gimbal keeps them centered
hero_caption: Cinematic orbit in RViz (3× speed). Red arrows are the planned 2.0 m circle; the inset is the robot's camera with the YOLOv8 detection.
links:
  - label: Full report (PDF)
    url: /assets/projects/ai-cameraman-robot/report.pdf
  # Add your repo link once it's public, e.g.:
  # - label: Code on GitHub
  #   url: https://github.com/USERNAME/ai-cameraman-robot
highlights:
  - value: 0.48°
    label: Mean framing error while following
  - value: 5.1 cm
    label: Radius RMSE on a 2.0 m orbit
  - value: 0.17 m
    label: Final error after indoor navigation
  - value: 0.34 s
    label: To stop after the target is lost
---

## Overview

The brief was a ground-based "drone camera": a wheeled robot that follows a person, keeps them centered in the shot, and performs cinematic moves on its own. Over eight weeks I built it in simulation as a differential-drive base carrying a yaw/pitch camera gimbal, an RGB camera and a 2D LiDAR, running ROS 2 Humble with Gazebo Fortress.

The final system has four operating modes. Each was validated from rosbag2 recordings (142,417 messages across four runs) rather than by watching the video, so every number on this page traces back to logged data.

## Demos

<div class="gallery two">
{% include video.html src="/assets/projects/ai-cameraman-robot/follow-behind.mp4" poster="/assets/projects/ai-cameraman-robot/follow-behind.jpg" caption="<strong>Follow-behind</strong> (4× speed). Holds about 2 m behind the subject while the gimbal keeps them centered." %}
{% include video.html src="/assets/projects/ai-cameraman-robot/side-tracking.mp4" poster="/assets/projects/ai-cameraman-robot/side-tracking.jpg" caption="<strong>Side tracking</strong> (4.5× speed). A curved approximation of a sideways dolly shot; the gimbal carries the framing." %}
{% include video.html src="/assets/projects/ai-cameraman-robot/cinematic-orbit.mp4" poster="/assets/projects/ai-cameraman-robot/cinematic-orbit.jpg" caption="<strong>Cinematic orbit</strong> (3× speed). A 2.0 m circle around the subject, executed by Nav2." %}
{% include video.html src="/assets/projects/ai-cameraman-robot/indoor-nav.mp4" poster="/assets/projects/ai-cameraman-robot/indoor-nav.jpg" caption="<strong>Indoor navigation</strong> (1.7× speed). AMCL localization and Nav2 planning through a walled map to reach the subject." %}
</div>

## Architecture

{% include figure.html src="/assets/projects/ai-cameraman-robot/architecture.svg" alt="ROS 2 node architecture from camera to gimbal and drive base" caption="Final ROS 2 architecture. Perception feeds two independent branches: one points the camera, the other decides how the base moves." class="scroll-x" %}

### Framing is separate from motion

The gimbal's only job is to keep the subject centered. A framing controller turns the detector's angular error into a yaw/pitch target, and a rate-limited PID stabilizer sends position commands through `ros2_control`. Because this runs independently of the base, the robot can drive tangent to a circle during an orbit while the camera stays locked on the person.

### One owner for the base in each mode

Two controllers publishing velocity to the same base is a classic ROS bug, so each mode has exactly one motion owner. Follow-behind and side tracking command the base directly for low latency. Orbit and indoor navigation need global paths and obstacle avoidance, so they hand goals to Nav2.

### A lightweight target estimate

The controllers don't need a full 3D pose, just where the person is relative to the base. Bearing comes from the measured gimbal yaw minus the camera's horizontal error. Distance comes from the bounding-box height: `d = min(1.804 / h, 10 m)`, where the 1.804 scale was calibrated from a known 2.5 m target distance.

### Safety you can measure

Target messages are timestamped and confidence-gated. If they go stale, the base controller publishes zero velocity. A dedicated test cut the target feed mid-motion: the stop command went out **0.336 s** after the last target message, and motion resumed about 35 ms after the target was reacquired.

## Results

| Mode | Goal | Measured result |
|---|---|---|
| Follow-behind | Hold 2.0 m, keep subject centered | 2.18 ± 0.06 m mean distance, 97% of the time within 1.9–2.3 m, 0.48° framing error |
| Side tracking | Hold a side view | 0.93° steady-state framing error |
| Cinematic orbit | 2.0 m circle around the subject | 1.967 ± 0.039 m measured radius (5.1 cm RMSE), 353° of 360° covered |
| Indoor navigation | Reach a goal near the subject | 6.9 m route, 0.17 m final error, never closer than 0.355 m to an obstacle |
| Tracking loss | Stop safely | Zero-velocity command 0.34 s after the last target message |

<div class="gallery two">
{% include figure.html src="/assets/projects/ai-cameraman-robot/follow-distance.png" caption="Follow-behind: estimated subject distance against the 2.0 m setpoint." class="light-bg" %}
{% include figure.html src="/assets/projects/ai-cameraman-robot/follow-yaw-error.png" caption="Follow-behind: gimbal framing error stays within about ±1.5°." class="light-bg" %}
{% include figure.html src="/assets/projects/ai-cameraman-robot/orbit-trajectory.png" caption="Orbit: commanded 2.0 m circle vs. the AMCL-measured path." class="light-bg" %}
{% include figure.html src="/assets/projects/ai-cameraman-robot/indoor-trajectory.png" caption="Indoor navigation: AMCL trajectory from start to goal." class="light-bg" %}
</div>

{% include figure.html src="/assets/projects/ai-cameraman-robot/tracking-loss.png" caption="Tracking-loss test: velocity drops to zero shortly after target messages stop, and resumes when the target returns." class="light-bg" %}

## Debugging that mattered

**The robot wouldn't move, but the controller was fine.** During an orbit test, Nav2 accepted the goal and published non-zero velocity, yet the wheels stayed still. Instead of retuning, I traced the command layer by layer: goal acceptance, `/cmd_vel_nav`, the velocity smoother, the diff-drive subscription, joint states. The ROS graph showed duplicated diff-drive subscribers and stale Gazebo state left over from repeated launches. A clean restart fixed it with no code changes. The lesson: ask *where the command stops being realized* before asking which gain to change.

**Gimbal wrap-around at ±180°.** Large rotations during orbits produced jumps where an angle wrapped from +π to −π. Expanding the yaw joint range and switching to rate-limited incremental commands fixed it; the PID was tuned only after the representation was right.

**Making the orbit reliable.** The first subject-position estimate was off by almost a meter until I corrected the bearing convention, bringing it to a few centimeters. Long 24-waypoint goals sometimes cancelled mid-run, so I split them into two 12-waypoint phases. I also replaced manual "2D Pose Estimate" clicks with an automatic initial-pose publisher, and regenerated the occupancy map so it matched the world.

**Accepting a mechanical limit.** A differential-drive base can't slide sideways, so true side tracking is impossible. Rather than fight it with tuning, I designed an achievable curved behavior, let the gimbal carry the framing, and documented that an omnidirectional base would be the right hardware for real lateral shots.

## Limitations and next steps

Everything here is simulation: no motor backlash, sensor noise, motion blur or wheel slip. The subject is a textured billboard rather than an animated person, distance comes from a single camera, and the orbit locks its center when it starts. The next steps I'd take are depth sensing or learned depth for range, Kalman filtering to predict a moving subject, an orbit that re-centers on a walking person, and moving the stack onto real hardware.

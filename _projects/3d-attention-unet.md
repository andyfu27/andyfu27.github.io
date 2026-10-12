---
title: 3D Attention U-Net for Mouse CT Segmentation
category: Machine Learning · Research
period: Jan – Jun 2025
order: 4
summary: >-
  An independent study in which I rewrote a 2D TensorFlow bone-segmentation pipeline as a 3D Attention U-Net in PyTorch
  that learns from whole mouse CT volumes. I got the full pipeline training on one GPU; the results showed
  exactly where it falls short, and I traced the causes.
card_summary: Rewrote a 2D TensorFlow CT segmentation pipeline as a 3D Attention U-Net in PyTorch, then diagnosed why the first model fell short.
role: Independent study (sole developer)
team: Computational Imaging Group, WashU
status: Research prototype (report May 2025)
tags: [Machine Learning, Medical Imaging, Research]
tools: [PyTorch, TorchIO, h5py, Mixed precision (AMP), TensorBoard, Linux GPU server]
thumbnail: /assets/projects/3d-attention-unet/cover.jpg
thumbnail_alt: Maximum-intensity projection of a mouse CT scan showing the skeleton
hero: /assets/projects/3d-attention-unet/ct-mip-top.png
hero_alt: Top-view maximum-intensity projection of a mouse CT scan
hero_caption: Top-view maximum-intensity projection of one of the mouse CT scans. The task is to label each voxel as spine, left or right femur, pelvis, other bone, or background.
links:
  - label: Full report (PDF)
    url: /assets/projects/3d-attention-unet/report.pdf
highlights:
  - value: 2D → 3D
    label: TensorFlow slices rewritten as PyTorch volumes
  - value: 7 classes
    label: Voxel-wise labels per scan
  - value: 5 scans
    label: 3 train / 1 validation / 1 test
---

## Overview

The lab segmented bones in mouse CT scans one 2D slice at a time, with a TensorFlow model reading TFRecords. A slice-based model can't see how a bone continues from one slice to the next, and it needs positional encoding added artificially. CT scans are 3D by nature, so I rewrote the pipeline end to end as a **3D Attention U-Net in PyTorch** that takes whole volumes as input.

## What I built

- **Model:** a 5-level 3D U-Net (64 starting channels) with an attention gate on every skip connection. The gates use decoder context to weight the encoder features voxel by voxel, so irrelevant regions are suppressed before the features are merged back.
- **Data:** direct HDF5 loading of CT volumes and 7-channel masks, TorchIO z-normalization, and crop-or-pad from about 184 × 122 × 657 voxels to 96 × 96 × 160 so a volume fits on the GPU.
- **Training:** combined class-weighted cross-entropy and Dice loss, Adam with a linear warm-up followed by exponential learning-rate decay, best checkpoint kept by validation Dice.
- **Evaluation:** per-class Dice, Jaccard, recall and precision, confusion matrices, and slice-by-slice visualizations in all three planes.

### A checker script first

The pipeline had many moving parts, so before any full training run I wrote a standalone checker. It loads one scan and mask, runs them through the same transforms and a forward pass, computes the loss and Dice, and verifies tensor shapes at each step. Timing every stage showed the data loader stalling at one-hot encoding the masks. I replaced it with label-index masks throughout the pipeline, which unblocked everything else.

### Fitting 3D on one GPU

Whole volumes are much larger than slices. Cropping, a batch size of 1, and clearing cached GPU memory after each step weren't enough to fit the full-depth model. **Mixed-precision training** with PyTorch's `autocast` and `GradScaler` was what made the 5-level network fit on an RTX 2080 Ti.

{% include figure.html src="/assets/projects/3d-attention-unet/preprocessed-coronal.png" caption="A preprocessed coronal slice and its ground-truth labels: spine (red), pelvis (yellow), other bones (magenta)." class="light-bg" %}

## Results

With only three training scans, the first model did not segment well, and I report that as it is.

{% include figure.html src="/assets/projects/3d-attention-unet/training-curves.png" caption="Loss and Dice per epoch. Validation Dice peaked near epoch 24, then both curves fell off." class="light-bg" %}

- **Training:** validation loss spiked early, and validation Dice peaked around epoch 24 before both curves declined. Training Dice rose above 1.0, which is impossible for a correct Dice score, so the metric or loss code itself needs fixing.
- **Spine:** detected with 68% recall but very low precision. The model labeled far too much as spine.
- **Femurs and pelvis:** never predicted. The small femurs were barely present in the cropped volumes, and class imbalance pushed predictions toward spine and "other bones."
- **Background:** Dice 0.62, with 0.99 precision.

<div class="gallery two">
{% include figure.html src="/assets/projects/3d-attention-unet/confusion-matrix.png" caption="Confusion matrix on the test scan, normalized by row." class="light-bg" %}
{% include figure.html src="/assets/projects/3d-attention-unet/class-scores.png" caption="Dice, Jaccard, recall and precision for each class." class="light-bg" %}
</div>

{% include figure.html src="/assets/projects/3d-attention-unet/prediction-overview.png" caption="CT, ground truth and prediction in three planes. The spine is partly found; pelvis and background are over-segmented." class="light-bg" %}

## What I'd change

- **Fix the evaluation first.** A training Dice above 1.0 means the metric or loss is wrong, and every other conclusion depends on it.
- **Train on 3D patches** instead of one cropped volume. Patches keep the femurs and pelvis in view, allow larger batches, and act as data augmentation.
- **Handle class imbalance** with weights based on both voxel frequency and structure size, or a loss designed for imbalanced segmentation.
- **More data and longer training,** with a learning-rate schedule that doesn't decay too early.

## What I learned

Building and validating a full 3D pipeline taught me as much as the model did. A small checker script found the one-hot bottleneck faster than any training run would have. Mixed precision was the difference between a model that fits and one that doesn't. Reading results critically, including a metric that went above its own maximum, told me more about the next steps than a good-looking number would have.

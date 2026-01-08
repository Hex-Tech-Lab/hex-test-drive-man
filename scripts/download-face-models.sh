#!/bin/bash
# Download face-api.js models
# Created: 2026-01-08
# Agent: BB
# MVP 1.5 Phase 2

set -e

MODELS_DIR="public/models"
BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

echo "Creating models directory..."
mkdir -p "$MODELS_DIR"

echo "Downloading face detection models..."

# Tiny Face Detector
curl -L "$BASE_URL/tiny_face_detector_model-weights_manifest.json" -o "$MODELS_DIR/tiny_face_detector_model-weights_manifest.json"
curl -L "$BASE_URL/tiny_face_detector_model-shard1" -o "$MODELS_DIR/tiny_face_detector_model-shard1"

# Face Landmark 68
curl -L "$BASE_URL/face_landmark_68_model-weights_manifest.json" -o "$MODELS_DIR/face_landmark_68_model-weights_manifest.json"
curl -L "$BASE_URL/face_landmark_68_model-shard1" -o "$MODELS_DIR/face_landmark_68_model-shard1"

# Face Recognition
curl -L "$BASE_URL/face_recognition_model-weights_manifest.json" -o "$MODELS_DIR/face_recognition_model-weights_manifest.json"
curl -L "$BASE_URL/face_recognition_model-shard1" -o "$MODELS_DIR/face_recognition_model-shard1"
curl -L "$BASE_URL/face_recognition_model-shard2" -o "$MODELS_DIR/face_recognition_model-shard2"

echo "Models downloaded successfully!"
echo "Total size:"
du -sh "$MODELS_DIR"

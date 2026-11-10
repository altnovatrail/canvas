#!/usr/bin/env bash
# The image of the toolchain stage of .devcontainer/Dockerfile, tagged toolchain, for the jobs of
# the emulators' workflows that run in it (T82 in RUN.md; R57 in docs/decisions.md). The job's
# cache step restores build/toolchain.tar by the Dockerfile's sha256, and the script does what
# spec's toolchain.sh does with its TOOLCHAIN_IMAGE_FILE from v0.13.0 of spec (the second
# 2026-11-09 amendment to R31 in spec; the T88 amendment to R57):
#   - a file there is loaded, and the image toolchain it gave is held to be there — which holds on
#     a hosted runner, which has no image of that name before —; then the file is removed and
#     nothing is built. The image is in Docker now, and the emulator wants the disk;
#   - a file that does not load, or loads another image, is removed and the stage is built, with a
#     warning, and no file is written: the cache was hit, and its entry cannot change;
#   - with no file the stage is built and saved there, for the job's next step to put into the
#     cache. A save that fails leaves a warning and no file, and the script still succeeds: the
#     image is there.
#
#   bash emulators/toolchain.sh
set -euo pipefail

tar=build/toolchain.tar
start=$SECONDS

# The Dockerfile copies nothing from the repository, so it is built without a context, as
# .github's workflows build it.
build() {
  docker build --target toolchain --tag toolchain - < .devcontainer/Dockerfile
}

if [[ -f "$tar" ]]; then
  if docker load --quiet --input "$tar" > /dev/null && docker image inspect toolchain > /dev/null; then
    rm -f -- "$tar"
    echo "toolchain: loaded from the cache in $((SECONDS - start)) s"
    exit 0
  fi
  rm -f -- "$tar"
  echo "::warning::toolchain: the cache's file did not give the image toolchain, so it is built. The cache entry that held the file is broken and stays: delete it (gh cache delete), or it is hit again"
  build
  echo "toolchain: built in $((SECONDS - start)) s"
  exit 0
fi
mkdir -p "$(dirname "$tar")"
build
if ! docker save --output "$tar" toolchain; then
  rm -f -- "$tar"
  echo "::warning::toolchain: docker save could not write the cache's file; the image is built, but not cached"
  echo "toolchain: built in $((SECONDS - start)) s"
  exit 0
fi
echo "toolchain: built and saved in $((SECONDS - start)) s"

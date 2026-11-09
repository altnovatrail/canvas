#!/usr/bin/env bash
# The image of the toolchain stage of .devcontainer/Dockerfile, tagged toolchain, for the jobs of
# the emulators' workflows that run in it (T82 in RUN.md; R57 in docs/decisions.md). The job's
# cache step restores build/toolchain.tar by the Dockerfile's sha256: when it did, the image is
# loaded from it and the Dockerfile does not run, so no server it downloads from is asked; when it
# did not, or the file does not load, the image is built and saved there, for the job's next step
# to put into the cache. A file loaded is removed at once: the image it held is in Docker now, and
# the emulator wants the disk.
#
#   bash emulators/toolchain.sh
set -euo pipefail

tar=build/toolchain.tar
start=$SECONDS
if [[ -f "$tar" ]] && docker load --quiet --input "$tar"; then
  rm -f "$tar"
  echo "toolchain: loaded from the cache in $((SECONDS - start)) s"
  exit 0
fi
if [[ -f "$tar" ]]; then
  echo "toolchain: the cache's file does not load; building the image"
  rm -f "$tar"
fi
mkdir -p "$(dirname "$tar")"
# The Dockerfile copies nothing from the repository, so it is built without a context, as
# .github's workflows build it.
docker build --target toolchain --tag toolchain - < .devcontainer/Dockerfile
docker save --output "$tar" toolchain
echo "toolchain: built and saved in $((SECONDS - start)) s"

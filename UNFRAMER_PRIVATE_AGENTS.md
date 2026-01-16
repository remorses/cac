# Unframer Private Guidelines

## Git Submodules

This repo uses git submodules for `spiceflow` and `unframer`. Always keep submodules on their respective `main` branches.

When working with submodules:
1. After cloning, run `git submodule update --init`
2. Before making changes in a submodule, ensure you're on `main`: `git checkout main`
3. Never leave submodules in detached HEAD state with uncommitted changes
4. Commit submodule changes to `main` branch, then update the parent repo reference

If you see submodules in detached HEAD:
```bash
cd spiceflow && git checkout main
cd ../unframer && git checkout main
```

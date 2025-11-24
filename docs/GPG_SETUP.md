# GPG Commit Signing Setup

## Why GPG Signing?
All commits must be cryptographically signed to verify author identity and prevent impersonation.

## Current Status
- GPG Key ID: CC83443B623D2D5D
- Auto-signing enabled: true

## For Contributors
1. Generate GPG key: gpg --full-generate-key
2. Get key ID: gpg --list-secret-keys --keyid-format=long
3. Configure Git:
   git config --global user.signingkey <KEY_ID>
   git config --global commit.gpgsign true
4. Add public key to GitHub: Settings → SSH and GPG keys

## Verification
Check commit signature:
  git log --show-signature -1

## Troubleshooting
If signing fails:
- Ensure GPG agent is running: gpgconf --kill gpg-agent && gpgconf --launch gpg-agent
- Test signing: echo "test" | gpg --clearsign

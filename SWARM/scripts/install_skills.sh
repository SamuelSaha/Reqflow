#!/bin/bash
set -e

echo "Installing skills..."

# Install vercel-react-best-practices
npx -y skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices -y

# Install web-design-guidelines
npx -y skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines -y

# Install find-skills
npx -y skills add https://github.com/vercel-labs/skills --skill find-skills -y

# Install frontend-design
npx -y skills add https://github.com/anthropics/skills --skill frontend-design -y

# Install tailwind-design-system
npx -y skills add https://github.com/wshobson/agents --skill tailwind-design-system -y

# Install marketing-psychology
npx -y skills add https://github.com/coreyhaines31/marketingskills --skill marketing-psychology -y

# Install programmatic-seo
npx -y skills add https://github.com/coreyhaines31/marketingskills --skill programmatic-seo -y

# Install competitor-alternatives
npx -y skills add https://github.com/coreyhaines31/marketingskills --skill competitor-alternatives -y

# Install ui-ux-pro-max
npx -y skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max -y

# Install copywriting
npx -y skills add https://github.com/coreyhaines31/marketingskills --skill copywriting -y

echo "All skills installed successfully."

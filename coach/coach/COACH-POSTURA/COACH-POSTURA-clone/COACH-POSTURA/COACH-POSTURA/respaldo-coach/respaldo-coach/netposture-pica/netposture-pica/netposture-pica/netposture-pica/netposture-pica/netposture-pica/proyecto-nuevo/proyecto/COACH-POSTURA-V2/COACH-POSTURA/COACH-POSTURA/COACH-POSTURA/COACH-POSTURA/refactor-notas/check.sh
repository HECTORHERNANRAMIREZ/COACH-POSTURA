#!/bin/bash
cd ~/workspace/p
pnpm --filter @workspace/posture-coach run typecheck > /tmp/tc.txt 2>&1
norm() { grep "error TS" | sed -E 's/\([0-9]+,[0-9]+\)//; s/(error TS6305): Output file.*/\1/' | sort; }
norm < /tmp/tc.txt > /tmp/errores-ahora.txt
norm < refactor-notas/baseline-errores.txt > /tmp/base-norm.txt
echo "total ahora: $(wc -l < /tmp/errores-ahora.txt) (base: $(wc -l < /tmp/base-norm.txt))"
echo "nuevos:"; comm -13 /tmp/base-norm.txt /tmp/errores-ahora.txt | cut -c1-170
echo "desaparecidos:"; comm -23 /tmp/base-norm.txt /tmp/errores-ahora.txt | cut -c1-170
git status --short | head -5
echo fin

module.exports.run = function runAlphaBeta(req, res) {
  try {
    console.log("Alpha-Beta controller invoked");

    const {
      tree = {},
      values = {},
      root,
      maxDepth = 3
    } = req.body || {};

    if (!root) {
      return res.status(400).json({ error: "root node required" });
    }

    const steps = [];
    let stepIdx = 0;

    function alphaBeta(node, depth, alpha, beta, isMax) {
      stepIdx++;

      // Terminal condition
      if (depth === maxDepth || !tree[node]) {
        const val = values[node] ?? 0;

        steps.push({
          step: stepIdx,
          node,
          depth,
          role: isMax ? "MAX" : "MIN",
          alpha,
          beta,
          value: val,
          explanation: `Reached terminal node ${node} with value ${val}`
        });

        return val;
      }

      if (isMax) {
        let best = -Infinity;

        for (const child of tree[node]) {
          const val = alphaBeta(child, depth + 1, alpha, beta, false);
          best = Math.max(best, val);
          alpha = Math.max(alpha, best);

          steps.push({
            step: ++stepIdx,
            node,
            depth,
            role: "MAX",
            alpha,
            beta,
            value: best,
            explanation: `MAX updates alpha to ${alpha}`
          });

          if (alpha >= beta) {
            steps.push({
              step: ++stepIdx,
              node,
              depth,
              role: "MAX",
              alpha,
              beta,
              pruned: true,
              explanation: `Pruning remaining children of ${node} (alpha >= beta)`
            });
            break;
          }
        }
        return best;
      } else {
        let best = Infinity;

        for (const child of tree[node]) {
          const val = alphaBeta(child, depth + 1, alpha, beta, true);
          best = Math.min(best, val);
          beta = Math.min(beta, best);

          steps.push({
            step: ++stepIdx,
            node,
            depth,
            role: "MIN",
            alpha,
            beta,
            value: best,
            explanation: `MIN updates beta to ${beta}`
          });

          if (alpha >= beta) {
            steps.push({
              step: ++stepIdx,
              node,
              depth,
              role: "MIN",
              alpha,
              beta,
              pruned: true,
              explanation: `Pruning remaining children of ${node} (alpha >= beta)`
            });
            break;
          }
        }
        return best;
      }
    }

    const result = alphaBeta(root, 0, -Infinity, Infinity, true);

    return res.json({
      root,
      optimalValue: result,
      steps
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
